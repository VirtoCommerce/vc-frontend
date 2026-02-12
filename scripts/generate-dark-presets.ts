/**
 * Dark Preset Generator
 *
 * Reads each light preset JSON and generates a dark variant using OKLCH lightness inversion.
 * Validates WCAG AA contrast ratios (4.5:1 minimum for normal text).
 *
 * Usage: yarn generate:dark-presets
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, join, basename, relative } from "node:path";
import { parse, formatHex, wcagContrast, converter, clampChroma, displayable } from "culori";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IOklch {
  mode: "oklch";
  l: number;
  c: number;
  h?: number;
  alpha?: number;
}

type PresetType = Record<string, string>;

interface IContrastAdjustment {
  pair: string;
  original: number;
  adjusted: number;
  foregroundKey: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRESETS_DIR = resolve(import.meta.dirname, "../client-app/assets/presets");

const PALETTE_FAMILIES = ["primary", "secondary", "accent", "neutral", "warning", "danger", "success", "info"] as const;
const SHADE_LEVELS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/** Mirrored shade pairs for lightness inversion. */
const SHADE_MIRROR_PAIRS: ReadonlyArray<[number, number]> = [
  [50, 950],
  [100, 900],
  [200, 800],
  [300, 700],
  [400, 600],
];

const WCAG_AA_RATIO = 4.5;

const toOklch = converter("oklch");

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

function hexToOklch(hex: string): IOklch {
  const parsed = parse(hex);
  if (!parsed) {
    throw new Error(`Failed to parse color: ${hex}`);
  }
  const oklch = toOklch(parsed) as IOklch;
  return {
    mode: "oklch",
    l: oklch.l ?? 0,
    c: oklch.c ?? 0,
    h: oklch.h,
    alpha: oklch.alpha,
  };
}

function oklchToHex(color: IOklch): string {
  // Gamut-map to sRGB so formatHex never produces out-of-range values
  const clamped = displayable(color) ? color : clampChroma(color, "oklch");
  return formatHex(clamped);
}

function clampValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function invertLightness(lightness: number): number {
  return 1 - lightness;
}

/**
 * Adjust a foreground color's lightness until it achieves at least `targetRatio`
 * contrast against the given background hex. Returns the adjusted hex.
 */
function ensureContrast(fgHex: string, bgHex: string, targetRatio: number): { hex: string; adjusted: boolean } {
  const ratio = wcagContrast(fgHex, bgHex);
  if (ratio >= targetRatio) {
    return { hex: fgHex, adjusted: false };
  }

  const fgOklch = hexToOklch(fgHex);
  const bgOklch = hexToOklch(bgHex);

  // Determine direction: if bg is dark, push fg lighter; if bg is light, push fg darker
  const direction = bgOklch.l < 0.5 ? 1 : -1;
  const step = 0.01;
  let bestHex = fgHex;
  let currentL = fgOklch.l;

  for (let i = 0; i < 100; i++) {
    currentL += direction * step;
    currentL = clampValue(currentL, 0, 1);

    const candidate: IOklch = { ...fgOklch, l: currentL };
    const candidateHex = oklchToHex(candidate);
    const candidateRatio = wcagContrast(candidateHex, bgHex);

    if (candidateRatio >= targetRatio) {
      bestHex = candidateHex;
      break;
    }

    // If we hit the boundary without success, use the best we have
    if (currentL <= 0 || currentL >= 1) {
      bestHex = candidateHex;
      break;
    }
  }

  return { hex: bestHex, adjusted: true };
}

// ---------------------------------------------------------------------------
// Palette shade inversion
// ---------------------------------------------------------------------------

function isPaletteKey(key: string): boolean {
  return PALETTE_FAMILIES.some((family) => {
    const regex = new RegExp(`^color_${family}_\\d+$`);
    return regex.test(key);
  });
}

/** Inject minimum chroma for neutral family to prevent pure grey. */
function applyNeutralWarmth(color: IOklch, minChroma: number): void {
  color.c = Math.max(color.c, minChroma);
  color.h = color.h ?? 55;
}

/** Collect parsed OKLCH shades for a single palette family. */
function collectFamilyShades(lightPreset: PresetType, family: string): Record<number, IOklch> {
  const shades: Record<number, IOklch> = {};
  for (const shade of SHADE_LEVELS) {
    const key = `color_${family}_${shade}`;
    const hex = lightPreset[key];
    if (hex) {
      shades[shade] = hexToOklch(hex);
    }
  }
  return shades;
}

/** Invert a mirrored pair of shades, swapping their lightness values. */
function invertMirrorPair(
  family: string,
  lowShade: number,
  highShade: number,
  shades: Record<number, IOklch>,
  result: PresetType,
): void {
  const lowColor = shades[lowShade];
  const highColor = shades[highShade];

  if (!lowColor || !highColor) {
    return;
  }

  const darkLow: IOklch = { mode: "oklch", l: highColor.l, c: lowColor.c * 0.9, h: lowColor.h };
  const darkHigh: IOklch = { mode: "oklch", l: lowColor.l, c: highColor.c * 0.9, h: highColor.h };

  if (family === "neutral") {
    applyNeutralWarmth(darkLow, 0.006);
    applyNeutralWarmth(darkHigh, 0.008);
  }

  result[`color_${family}_${lowShade}`] = oklchToHex(darkLow);
  result[`color_${family}_${highShade}`] = oklchToHex(darkHigh);
}

/** Invert the 500 (mid) shade with optional clamping for semantic families. */
function invertMidShade(family: string, shades: Record<number, IOklch>, result: PresetType): void {
  const mid = shades[500];
  if (!mid) {
    return;
  }

  const invertedL = invertLightness(mid.l);
  const darkMid: IOklch = {
    mode: "oklch",
    l: family === "neutral" ? invertedL : clampValue(invertedL, 0.55, 0.85),
    c: mid.c * 0.9,
    h: mid.h,
  };

  if (family === "neutral") {
    applyNeutralWarmth(darkMid, 0.007);
  }

  result[`color_${family}_500`] = oklchToHex(darkMid);
}

function invertPaletteShades(lightPreset: PresetType): PresetType {
  const result: PresetType = {};

  for (const family of PALETTE_FAMILIES) {
    const shades = collectFamilyShades(lightPreset, family);

    for (const [lowShade, highShade] of SHADE_MIRROR_PAIRS) {
      invertMirrorPair(family, lowShade, highShade, shades, result);
    }

    invertMidShade(family, shades, result);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Semantic color inversion
// ---------------------------------------------------------------------------

/** Hardcoded color mappings for specific keys. */
const HARDCODED_COLORS: Record<string, string> = {
  color_additional_50: "#141110",
  color_additional_950: "#f0e6dd",
  color_mobile_menu_link_active: "#f0e6dd",
  color_mobile_menu_icon_active: "#f0e6dd",
};

/** Try to handle a specific named key with custom inversion logic. Returns null if not handled. */
function invertNamedSemanticKey(key: string, oklch: IOklch): string | null {
  if (key === "color_body_bg") {
    return oklchToHex({ mode: "oklch", l: 0.1, c: 0.012, h: oklch.h ?? 50 });
  }
  if (key === "color_body_text") {
    return oklchToHex({ mode: "oklch", l: 0.92, c: 0.015, h: oklch.h ?? 70 });
  }
  if (key === "color_price") {
    return oklchToHex({ ...oklch, l: Math.max(oklch.l, 0.8) });
  }
  if (key === "color_empty_list_icon") {
    return oklchToHex({ ...oklch, l: Math.max(oklch.l, 0.6) });
  }
  if (
    key === "color_mobile_menu_navigation" ||
    key === "color_mobile_menu_control" ||
    key === "color_mobile_active_control"
  ) {
    return oklchToHex({ ...oklch, l: Math.max(oklch.l, 0.6) });
  }
  if (key === "color_shape_icon_bg") {
    return oklchToHex({ ...oklch, l: clampValue(invertLightness(oklch.l), 0.45, 0.65), c: oklch.c * 0.9 });
  }
  if (key === "color_shape_icon") {
    return oklchToHex({ ...oklch, l: clampValue(invertLightness(oklch.l), 0.85, 0.98) });
  }
  return null;
}

/** Invert a semantic color based on its suffix (_bg, _text, _link). Returns null if not handled. */
function invertBySuffix(key: string, oklch: IOklch): string | null {
  if (key.endsWith("_bg")) {
    return oklchToHex({
      ...oklch,
      l: clampValue(invertLightness(oklch.l), 0.05, 0.2),
      c: Math.max(oklch.c * 0.6, 0.008),
      h: oklch.h,
    });
  }
  if (key.endsWith("_text")) {
    const targetC = oklch.c < 0.005 ? 0.015 : oklch.c * 0.7;
    const targetH = oklch.c < 0.005 ? 65 : oklch.h;
    return oklchToHex({ mode: "oklch", l: clampValue(invertLightness(oklch.l), 0.85, 0.98), c: targetC, h: targetH });
  }
  if (key.endsWith("_link") || key.endsWith("_link_hover") || key.endsWith("_link_active")) {
    return oklchToHex({ ...oklch, l: clampValue(invertLightness(oklch.l), 0.65, 0.85), c: oklch.c * 0.95 });
  }
  return null;
}

function invertSemanticColor(key: string, hex: string): string {
  const hardcoded = HARDCODED_COLORS[key];
  if (hardcoded) {
    return hardcoded;
  }

  const oklch = hexToOklch(hex);

  const namedResult = invertNamedSemanticKey(key, oklch);
  if (namedResult) {
    return namedResult;
  }

  const suffixResult = invertBySuffix(key, oklch);
  if (suffixResult) {
    return suffixResult;
  }

  // Any other semantic color: just invert lightness
  return oklchToHex({ ...oklch, l: invertLightness(oklch.l) });
}

// ---------------------------------------------------------------------------
// Contrast validation and fixing
// ---------------------------------------------------------------------------

/** Check a single fg/bg pair and auto-adjust fg lightness if contrast is below `ratio`. */
function checkAndFixContrast(
  darkPreset: PresetType,
  adjustments: IContrastAdjustment[],
  fgKey: string,
  bgKey: string,
  pairLabel: string,
  ratio: number = WCAG_AA_RATIO,
): void {
  const fgHex = darkPreset[fgKey];
  const bgHex = darkPreset[bgKey];

  if (!fgHex || !bgHex) {
    return;
  }

  const { hex, adjusted } = ensureContrast(fgHex, bgHex, ratio);
  if (adjusted) {
    const originalRatio = wcagContrast(fgHex, bgHex);
    const newRatio = wcagContrast(hex, bgHex);
    darkPreset[fgKey] = hex;
    adjustments.push({ pair: pairLabel, original: originalRatio, adjusted: newRatio, foregroundKey: fgKey });
  }
}

/** Validate palette 500 shades against dark surfaces. */
function validatePaletteContrast(darkPreset: PresetType, adjustments: IContrastAdjustment[]): void {
  const check = (fg: string, bg: string, label: string) => checkAndFixContrast(darkPreset, adjustments, fg, bg, label);

  // 500 shades on neutral_950
  for (const family of PALETTE_FAMILIES) {
    check(`color_${family}_500`, "color_neutral_950", `${family}_500 on neutral_950`);
  }

  // 500 shades on additional_50 (button text contrast)
  if (darkPreset["color_additional_50"]) {
    for (const family of PALETTE_FAMILIES) {
      if (family !== "neutral") {
        check(`color_${family}_500`, "color_additional_50", `${family}_500 on additional_50`);
      }
    }
  }
}

/** Validate section (header/footer) text and link contrast. */
function validateSectionContrast(darkPreset: PresetType, adjustments: IContrastAdjustment[]): void {
  const check = (fg: string, bg: string, label: string) => checkAndFixContrast(darkPreset, adjustments, fg, bg, label);
  const sections = ["header_top", "header_bottom", "footer_top", "footer_bottom"] as const;
  const linkSuffixes = ["_link", "_link_hover", "_link_active"];

  for (const section of sections) {
    const bgKey = `color_${section}_bg`;
    check(`color_${section}_text`, bgKey, `${section}_text on ${section}_bg`);

    for (const suffix of linkSuffixes) {
      const linkKey = `color_${section}${suffix}`;
      if (darkPreset[linkKey]) {
        check(linkKey, bgKey, `${section}${suffix} on ${section}_bg`);
      }
    }
  }
}

/** Validate non-text contrast for input borders (WCAG 1.4.11: 3:1). */
function validateBorderContrast(darkPreset: PresetType, adjustments: IContrastAdjustment[]): void {
  const NON_TEXT_RATIO = 3;
  const borderKey = "color_neutral_300";
  const surfaces = ["color_additional_50", "color_neutral_50", "color_body_bg"];

  for (const bgKey of surfaces) {
    checkAndFixContrast(
      darkPreset,
      adjustments,
      borderKey,
      bgKey,
      `neutral_300 on ${bgKey.replace("color_", "")}`,
      NON_TEXT_RATIO,
    );
  }
}

function validateAndFixContrast(darkPreset: PresetType): IContrastAdjustment[] {
  const adjustments: IContrastAdjustment[] = [];
  const check = (fg: string, bg: string, label: string) => checkAndFixContrast(darkPreset, adjustments, fg, bg, label);

  validatePaletteContrast(darkPreset, adjustments);
  check("color_body_text", "color_body_bg", "body_text on body_bg");
  validateSectionContrast(darkPreset, adjustments);
  validateBorderContrast(darkPreset, adjustments);

  // Mobile menu
  if (darkPreset["color_mobile_menu_bg"]) {
    check("color_mobile_menu_text", "color_mobile_menu_bg", "mobile_menu_text on mobile_menu_bg");
    check("color_mobile_menu_link", "color_mobile_menu_bg", "mobile_menu_link on mobile_menu_bg");
    if (darkPreset["color_mobile_menu_link_active"]) {
      check("color_mobile_menu_link_active", "color_mobile_menu_bg", "mobile_menu_link_active on mobile_menu_bg");
    }
  }

  return adjustments;
}

// ---------------------------------------------------------------------------
// Main processing
// ---------------------------------------------------------------------------

function processPreset(filePath: string): { outputPath: string; adjustments: IContrastAdjustment[] } {
  const raw = readFileSync(filePath, "utf-8");
  const lightPreset: PresetType = JSON.parse(raw);

  const darkPreset: PresetType = {};

  // 1. Invert palette shades
  const invertedPalette = invertPaletteShades(lightPreset);
  Object.assign(darkPreset, invertedPalette);

  // 2. Process semantic (non-palette) colors
  for (const [key, value] of Object.entries(lightPreset)) {
    if (isPaletteKey(key)) {
      continue; // Already handled
    }
    darkPreset[key] = invertSemanticColor(key, value);
  }

  // 3. Validate and fix WCAG AA contrast
  const adjustments = validateAndFixContrast(darkPreset);

  // 4. Build output preserving original key order
  const orderedDark: PresetType = {};
  for (const key of Object.keys(lightPreset)) {
    if (key in darkPreset) {
      orderedDark[key] = darkPreset[key];
    }
  }

  // Write output file
  const baseName = basename(filePath, ".json");
  const outputPath = join(PRESETS_DIR, `${baseName}.dark.json`);
  writeFileSync(outputPath, JSON.stringify(orderedDark, null, 2) + "\n", "utf-8");

  return { outputPath, adjustments };
}

function main(): void {
  console.log("=== Dark Preset Generator ===\n");

  // Find all light preset files (not *.dark.json)
  const files = readdirSync(PRESETS_DIR).filter((f) => f.endsWith(".json") && !f.endsWith(".dark.json"));

  if (files.length === 0) {
    console.log("No light preset files found in", PRESETS_DIR);
    return;
  }

  let totalAdjustments = 0;

  const sortedFiles = [...files].sort((a, b) => a.localeCompare(b));

  for (const file of sortedFiles) {
    const filePath = join(PRESETS_DIR, file);
    const presetName = basename(file, ".json");

    console.log(`Processing: ${presetName}`);

    const { outputPath, adjustments } = processPreset(filePath);

    if (adjustments.length > 0) {
      for (const adj of adjustments) {
        console.log(
          `  [contrast fix] ${adj.pair}: ${adj.original.toFixed(2)} -> ${adj.adjusted.toFixed(2)} (adjusted ${adj.foregroundKey})`,
        );
      }
      totalAdjustments += adjustments.length;
    } else {
      console.log("  All contrast checks passed");
    }

    console.log(`  -> ${relative(process.cwd(), outputPath)}`);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Presets processed: ${files.length}`);
  console.log(`Contrast adjustments: ${totalAdjustments}`);
  console.log("Done.");
}

main();
