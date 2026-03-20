#!/usr/bin/env bash
#
# Performance Benchmark Script for vc-theme-b2b-vue
#
# Usage:
#   ./scripts/benchmark.sh              # Run all benchmarks
#   ./scripts/benchmark.sh build        # Run only build benchmark
#   ./scripts/benchmark.sh lint         # Run only lint benchmark
#   ./scripts/benchmark.sh typecheck    # Run only type-check benchmark
#   ./scripts/benchmark.sh devserver    # Run only dev server startup benchmark
#   ./scripts/benchmark.sh sizes        # Run only bundle size analysis
#   ./scripts/benchmark.sh install      # Run only install benchmark
#   ./scripts/benchmark.sh compare <before.json> <after.json>
#
# Environment:
#   BENCHMARK_RUNS=3    Number of runs for median (default: 3)
#
# Raw data is written incrementally to artifacts/benchmark-<ts>.raw
# JSON is generated from that file at the end (or on Ctrl+C / failure)

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

RUNS="${BENCHMARK_RUNS:-3}"
ARTIFACTS_DIR="$PROJECT_DIR/artifacts"
mkdir -p "$ARTIFACTS_DIR"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
RAW_FILE="$ARTIFACTS_DIR/benchmark-$TIMESTAMP.raw"
JSON_FILE="$ARTIFACTS_DIR/benchmark-$TIMESTAMP.json"

# Colors (only if stderr is a terminal)
if [ -t 2 ]; then
  RED='\033[0;31m' GREEN='\033[0;32m' YELLOW='\033[1;33m'
  BLUE='\033[0;34m' CYAN='\033[0;36m' BOLD='\033[1m' NC='\033[0m'
else
  RED='' GREEN='' YELLOW='' BLUE='' CYAN='' BOLD='' NC=''
fi

# ─── Utilities ────────────────────────────────────────────────────────────────

log()    { echo -e "${BLUE}[bench]${NC} $*" >&2; }
ok()     { echo -e "${GREEN}  ✓${NC} $*" >&2; }
warn()   { echo -e "${YELLOW}  ⚠${NC} $*" >&2; }
header() { echo -e "\n${BOLD}${CYAN}━━━ $* ━━━${NC}\n" >&2; }

# Write a key=value to the raw file (append, immediately flushed)
record() {
  echo "$1=$2" >> "$RAW_FILE"
}

# Read a value from the raw file
read_record() {
  grep "^$1=" "$RAW_FILE" 2>/dev/null | tail -1 | cut -d= -f2-
}

# Time a command in milliseconds
time_ms() {
  local start end
  start=$(date +%s%N)
  "$@" > /dev/null 2>&1 || true
  end=$(date +%s%N)
  echo $(( (end - start) / 1000000 ))
}

# Run N times, return median
median_of() {
  local runs="$1"
  shift
  local -a times=()

  for ((i = 1; i <= runs; i++)); do
    log "  Run $i/$runs..."
    local t
    t=$(time_ms "$@")
    times+=("$t")
    log "  → ${t}ms"
  done

  local -a sorted
  IFS=$'\n' read -r -d '' -a sorted < <(printf '%s\n' "${times[@]}" | sort -n; printf '\0') || true
  echo "${sorted[$(( runs / 2 ))]}"
}

fmt_ms() {
  local ms="${1:-0}"
  if (( ms >= 60000 )); then
    printf '%dm %ds' "$((ms / 60000))" "$((ms % 60000 / 1000))"
  elif (( ms >= 1000 )); then
    printf '%d.%ds' "$((ms / 1000))" "$((ms % 1000 / 100))"
  else
    printf '%dms' "$ms"
  fi
}

fmt_bytes() {
  local bytes="${1:-0}"
  if (( bytes >= 1048576 )); then
    awk "BEGIN{printf \"%.2fMB\", $bytes/1048576}"
  elif (( bytes >= 1024 )); then
    awk "BEGIN{printf \"%.1fKB\", $bytes/1024}"
  else
    printf '%dB' "$bytes"
  fi
}

# ─── Convert raw → JSON (called on exit) ─────────────────────────────────────

raw_to_json() {
  if [ ! -f "$RAW_FILE" ]; then return; fi

  local git_msg
  git_msg=$(git log -1 --pretty=%s 2>/dev/null || echo "unknown")

  node --input-type=module -e "
    import { readFileSync } from 'fs';
    const raw = readFileSync(process.argv[1], 'utf8');
    const results = {};
    for (const line of raw.split('\n')) {
      const eq = line.indexOf('=');
      if (eq < 1) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim();
      // Keep last value for each key (allows overwrites)
      results[key] = /^[0-9]+$/.test(val) ? Number(val) : val;
    }
    const data = {
      timestamp: new Date().toISOString(),
      git_branch: $(node -p "JSON.stringify(process.argv[1])" -- "$(git branch --show-current 2>/dev/null || echo unknown)"),
      git_commit: $(node -p "JSON.stringify(process.argv[1])" -- "$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"),
      git_message: $(node -p "JSON.stringify(process.argv[1])" -- "$git_msg"),
      node_version: '$(node --version)',
      runs: $RUNS,
      results,
    };
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
  " -- "$RAW_FILE" > "$JSON_FILE" 2>/dev/null

  if [ -f "$JSON_FILE" ]; then
    ok "JSON: $JSON_FILE"
  fi
}

on_exit() {
  raw_to_json
  if [ -f "$RAW_FILE" ]; then
    ok "Raw:  $RAW_FILE"
  fi
}
trap on_exit EXIT

# ─── Benchmarks ───────────────────────────────────────────────────────────────

bench_build() {
  header "Production Build (median of $RUNS runs)"

  rm -rf "$PROJECT_DIR/dist"

  local median
  median=$(median_of "$RUNS" yarn vite build)

  record build_ms "$median"
  ok "Production build: $(fmt_ms "$median")"
}

bench_sizes() {
  header "Bundle Sizes"

  if [ ! -d "$PROJECT_DIR/dist" ]; then
    log "Building first..."
    yarn vite build > /dev/null 2>&1 || { warn "Build failed, skipping sizes"; return 0; }
  fi

  local dist_dir="$PROJECT_DIR/dist"

  # Total dist
  local total_bytes
  total_bytes=$(du -sb "$dist_dir" | awk '{print $1}')
  record dist_total_bytes "$total_bytes"
  ok "Total dist: $(fmt_bytes "$total_bytes")"

  # JS files
  local js_bytes=0 js_count=0
  while IFS= read -r -d '' f; do
    js_bytes=$((js_bytes + $(stat -c%s "$f")))
    js_count=$((js_count + 1))
  done < <(find "$dist_dir" -name '*.js' -print0 2>/dev/null)
  record js_total_bytes "$js_bytes"
  record js_file_count "$js_count"
  ok "JS total: $(fmt_bytes "$js_bytes") ($js_count files)"

  # CSS files
  local css_bytes=0 css_count=0
  while IFS= read -r -d '' f; do
    css_bytes=$((css_bytes + $(stat -c%s "$f")))
    css_count=$((css_count + 1))
  done < <(find "$dist_dir" -name '*.css' -print0 2>/dev/null)
  record css_total_bytes "$css_bytes"
  record css_file_count "$css_count"
  ok "CSS total: $(fmt_bytes "$css_bytes") ($css_count files)"

  # Vendor chunks (all vendor-*.js files combined)
  local vendor_bytes=0 vendor_gz=0 vendor_count=0
  while IFS= read -r -d '' f; do
    vendor_bytes=$((vendor_bytes + $(stat -c%s "$f")))
    vendor_gz=$((vendor_gz + $(gzip -c "$f" | wc -c)))
    vendor_count=$((vendor_count + 1))
  done < <(find "$dist_dir" -name 'vendor-*.js' -print0 2>/dev/null)
  if [ "$vendor_count" -gt 0 ]; then
    record vendor_chunk_bytes "$vendor_bytes"
    record vendor_chunk_gzip_bytes "$vendor_gz"
    ok "Vendor: $(fmt_bytes "$vendor_bytes") → gzip $(fmt_bytes "$vendor_gz") ($vendor_count files)"
  fi

  # App code (all JS except vendor-*.js chunks)
  local app_bytes=0 app_gz=0 app_count=0
  while IFS= read -r -d '' f; do
    app_bytes=$((app_bytes + $(stat -c%s "$f")))
    app_gz=$((app_gz + $(gzip -c "$f" | wc -c)))
    app_count=$((app_count + 1))
  done < <(find "$dist_dir" -name '*.js' ! -name 'vendor-*.js' -print0 2>/dev/null)
  record app_chunk_bytes "$app_bytes"
  record app_chunk_gzip_bytes "$app_gz"
  ok "App:    $(fmt_bytes "$app_bytes") → gzip $(fmt_bytes "$app_gz") ($app_count files, excl. vendor)"

  # Gzipped totals
  local js_gz=0
  while IFS= read -r -d '' f; do
    js_gz=$((js_gz + $(gzip -c "$f" | wc -c)))
  done < <(find "$dist_dir" -name '*.js' -print0 2>/dev/null)
  record js_total_gzip_bytes "$js_gz"
  ok "JS total (gzip): $(fmt_bytes "$js_gz")"

  local css_gz=0
  while IFS= read -r -d '' f; do
    css_gz=$((css_gz + $(gzip -c "$f" | wc -c)))
  done < <(find "$dist_dir" -name '*.css' -print0 2>/dev/null)
  record css_total_gzip_bytes "$css_gz"
  ok "CSS total (gzip): $(fmt_bytes "$css_gz")"

  # Top 5 JS files
  log "Largest JS files:"
  find "$dist_dir" -name '*.js' -printf '%s %f\n' | sort -rn | head -5 | while read -r size name; do
    log "    $(fmt_bytes "$size")  $name"
  done || true
}

bench_lint() {
  header "Lint (median of $RUNS runs)"
  local median
  median=$(median_of "$RUNS" yarn lint --quiet)
  record lint_ms "$median"
  ok "Lint: $(fmt_ms "$median")"
}

bench_typecheck() {
  header "Type Checking (median of $RUNS runs)"
  local median
  median=$(median_of "$RUNS" yarn validate:types)
  record typecheck_ms "$median"
  ok "Type check: $(fmt_ms "$median")"
}

bench_devserver() {
  header "Dev Server Startup"

  # Kill any leftover process on benchmark port
  local existing_pid
  existing_pid=$(lsof -ti:4173 2>/dev/null || true)
  if [ -n "$existing_pid" ]; then
    kill "$existing_pid" 2>/dev/null || true
    sleep 1
  fi

  local tmp_out
  tmp_out=$(mktemp)

  log "Starting dev server on port 4173..."
  local start
  start=$(date +%s%N)

  stdbuf -oL yarn vite --host 127.0.0.1 --port 4173 > "$tmp_out" 2>&1 &
  local pid=$!

  local timeout_secs=120 waited=0
  while ! grep -q "ready in" "$tmp_out" 2>/dev/null; do
    sleep 0.2
    waited=$((waited + 1))
    if (( waited > timeout_secs * 5 )); then
      warn "Dev server didn't start within ${timeout_secs}s"
      kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true
      rm -f "$tmp_out"
      return 0
    fi
    if ! kill -0 "$pid" 2>/dev/null; then
      warn "Dev server process died"
      rm -f "$tmp_out"
      return 0
    fi
  done

  local end
  end=$(date +%s%N)
  local startup_ms=$(( (end - start) / 1000000 ))

  local vite_time
  vite_time=$(grep -oP 'ready in \K[0-9]+' "$tmp_out" 2>/dev/null || echo "")

  kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true
  rm -f "$tmp_out"

  record devserver_startup_ms "$startup_ms"
  ok "Dev server startup (wall): $(fmt_ms "$startup_ms")"

  if [ -n "$vite_time" ]; then
    record devserver_vite_reported_ms "$vite_time"
    ok "Dev server (Vite reported): ${vite_time}ms"
  fi
}

bench_install() {
  header "Clean Install"
  log "Removing node_modules..."
  rm -rf "$PROJECT_DIR/node_modules"

  local ms
  ms=$(time_ms yarn install)
  record install_ms "$ms"
  ok "Clean install: $(fmt_ms "$ms")"

  local nm_bytes
  nm_bytes=$(du -sb "$PROJECT_DIR/node_modules" | awk '{print $1}')
  record node_modules_bytes "$nm_bytes"
  ok "node_modules: $(fmt_bytes "$nm_bytes")"
}

bench_source_stats() {
  header "Source Statistics"

  local vue_count ts_count scss_count total_lines
  vue_count=$(find "$PROJECT_DIR/client-app" -name '*.vue' | wc -l)
  ts_count=$(find "$PROJECT_DIR/client-app" \( -name '*.ts' -o -name '*.tsx' \) | wc -l)
  scss_count=$(find "$PROJECT_DIR/client-app" -name '*.scss' | wc -l)
  total_lines=$(find "$PROJECT_DIR/client-app" \( -name '*.vue' -o -name '*.ts' -o -name '*.tsx' -o -name '*.scss' \) -exec cat {} + 2>/dev/null | wc -l)

  record vue_files "$vue_count"
  record ts_files "$ts_count"
  record scss_files "$scss_count"
  record total_source_lines "$total_lines"

  ok "Vue files:    $vue_count"
  ok "TS files:     $ts_count"
  ok "SCSS files:   $scss_count"
  ok "Total lines:  $total_lines"
}

# ─── Run with error isolation ─────────────────────────────────────────────────

run_bench() {
  local name="$1"; shift
  if ! "$@"; then
    warn "$name failed — continuing"
  fi
}

# ─── Compare ──────────────────────────────────────────────────────────────────

compare() {
  local before="${1:-}" after="${2:-}"

  if [ -z "$before" ] || [ -z "$after" ] || [ ! -f "$before" ] || [ ! -f "$after" ]; then
    echo "Usage: $0 compare <before.json> <after.json>" >&2
    exit 1
  fi

  header "Benchmark Comparison"
  log "Before: $before"
  log "After:  $after"
  echo "" >&2

  node --input-type=module -e "
    import { readFileSync } from 'fs';
    const args = process.argv.filter(a => a !== '--' && !a.startsWith('-'));
    const [bFile, aFile] = args.slice(-2);
    const before = JSON.parse(readFileSync(bFile, 'utf8'));
    const after  = JSON.parse(readFileSync(aFile, 'utf8'));

    const fms = ms => { ms=+ms; return ms>=60000?(ms/60000).toFixed(1)+'m':ms>=1000?(ms/1000).toFixed(1)+'s':ms+'ms'; };
    const fby = b  => { b=+b; return b>=1048576?(b/1048576).toFixed(2)+'MB':b>=1024?(b/1024).toFixed(1)+'KB':b+'B'; };
    const R='\x1b[31m',G='\x1b[32m',N='\x1b[0m',B='\x1b[1m';

    const row = (label, bv, av, fmt, lower=true) => {
      if(bv==null||av==null) return;
      bv=+bv; av=+av;
      const d=av-bv, pct=bv?((d/bv)*100).toFixed(1):'∞';
      const better=lower?d<0:d>0, c=d===0?N:better?G:R;
      const s=d>0?'+':'', a=d===0?'=':better?'↓':'↑';
      console.log('  '+label.padEnd(24)+fmt(bv).padStart(12)+' → '+fmt(av).padStart(12)+'  '+c+a+' '+s+pct+'%'+N);
    };

    console.log(B+'  Timing'+N); console.log('  '+'─'.repeat(68));
    [['build_ms','Build'],['lint_ms','ESLint'],['typecheck_ms','Type Check'],['devserver_startup_ms','Dev Server'],['install_ms','Install']].forEach(([k,l])=>row(l,before.results?.[k],after.results?.[k],fms));
    console.log(); console.log(B+'  Sizes'+N); console.log('  '+'─'.repeat(68));
    [['dist_total_bytes','Total dist'],['js_total_bytes','JS'],['js_total_gzip_bytes','JS (gzip)'],['css_total_bytes','CSS'],['css_total_gzip_bytes','CSS (gzip)'],['vendor_chunk_bytes','Vendor'],['vendor_chunk_gzip_bytes','Vendor (gzip)'],['app_chunk_bytes','App'],['app_chunk_gzip_bytes','App (gzip)'],['node_modules_bytes','node_modules']].forEach(([k,l])=>row(l,before.results?.[k],after.results?.[k],fby));
  " -- "$before" "$after" >&2
}

# ─── Summary ──────────────────────────────────────────────────────────────────

print_summary() {
  if [ ! -f "$RAW_FILE" ]; then return; fi

  header "Summary"
  printf "  ${BOLD}%-26s  %-14s %s${NC}\n" "Metric" "Raw" "Gzip" >&2
  echo "  ─────────────────────────────────────────────────" >&2

  local v
  v=$(read_record build_ms);              [ -n "$v" ] && printf "  %-26s  %s\n" "Production build" "$(fmt_ms "$v")" >&2
  v=$(read_record lint_ms);               [ -n "$v" ] && printf "  %-26s  %s\n" "ESLint" "$(fmt_ms "$v")" >&2
  v=$(read_record typecheck_ms);          [ -n "$v" ] && printf "  %-26s  %s\n" "Type check" "$(fmt_ms "$v")" >&2
  v=$(read_record devserver_startup_ms);  [ -n "$v" ] && printf "  %-26s  %s\n" "Dev server startup" "$(fmt_ms "$v")" >&2

  local raw gz
  raw=$(read_record js_total_bytes); gz=$(read_record js_total_gzip_bytes)
  [ -n "$raw" ] && printf "  %-26s  %-14s %s\n" "JS bundle" "$(fmt_bytes "$raw")" "$(fmt_bytes "${gz:-0}")" >&2

  raw=$(read_record css_total_bytes); gz=$(read_record css_total_gzip_bytes)
  [ -n "$raw" ] && printf "  %-26s  %-14s %s\n" "CSS bundle" "$(fmt_bytes "$raw")" "$(fmt_bytes "${gz:-0}")" >&2

  raw=$(read_record vendor_chunk_bytes); gz=$(read_record vendor_chunk_gzip_bytes)
  [ -n "$raw" ] && printf "  %-26s  %-14s %s\n" "Vendor chunk" "$(fmt_bytes "$raw")" "$(fmt_bytes "${gz:-0}")" >&2

  raw=$(read_record app_chunk_bytes); gz=$(read_record app_chunk_gzip_bytes)
  [ -n "$raw" ] && printf "  %-26s  %-14s %s\n" "App chunk" "$(fmt_bytes "$raw")" "$(fmt_bytes "${gz:-0}")" >&2

  v=$(read_record install_ms);       [ -n "$v" ] && printf "  %-26s  %s\n" "Clean install" "$(fmt_ms "$v")" >&2
  v=$(read_record node_modules_bytes); [ -n "$v" ] && printf "  %-26s  %s\n" "node_modules" "$(fmt_bytes "$v")" >&2
  echo "" >&2
}

# ─── Main ─────────────────────────────────────────────────────────────────────

main() {
  local cmd="${1:-all}"

  echo "" >&2
  echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${NC}" >&2
  echo -e "${BOLD}${CYAN}║     vc-theme-b2b-vue Performance Benchmark      ║${NC}" >&2
  echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${NC}" >&2
  echo "" >&2
  log "Date:    $(date)"
  log "Branch:  $(git branch --show-current 2>/dev/null || echo 'unknown')"
  log "Commit:  $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
  log "Node:    $(node --version)"
  log "Runs:    $RUNS (set BENCHMARK_RUNS=N to change)"
  log "Raw:     $RAW_FILE"
  echo "" >&2

  # Write metadata to raw file
  record _timestamp "$(date -Iseconds)"
  record _git_branch "$(git branch --show-current 2>/dev/null || echo unknown)"
  record _git_commit "$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"

  case "$cmd" in
    build)     run_bench build bench_build ;;
    sizes)     run_bench sizes bench_sizes ;;
    lint)      run_bench lint bench_lint ;;
    typecheck) run_bench typecheck bench_typecheck ;;
    devserver) run_bench devserver bench_devserver ;;
    install)   run_bench install bench_install ;;
    stats)     run_bench stats bench_source_stats ;;
    compare)   compare "${2:-}" "${3:-}"; exit 0 ;;
    all)
      run_bench stats     bench_source_stats
      run_bench build     bench_build
      run_bench sizes     bench_sizes
      run_bench lint      bench_lint
      run_bench typecheck bench_typecheck
      run_bench devserver bench_devserver
      ;;
    *)
      echo "Usage: $0 {all|build|sizes|lint|typecheck|devserver|install|stats|compare}" >&2
      exit 1
      ;;
  esac

  print_summary
}

main "$@"
