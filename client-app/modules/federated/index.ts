import { loadRemote, registerRemotes } from "@module-federation/enhanced/runtime";
import { Logger } from "@/core/utilities";
import { version as CORE_VERSION } from "@/core-api/package.json";
import { checkHostCompatibility } from "./version-gate";

/**
 * Host-side loader for Module Federation plugins. For each configured
 * remote: read its manifest, version-check it, `loadRemote` its `./plugin` expose, and
 * call `init()`. Plugins bind to the host's live services via the shared facade.
 * - Version safety: an incompatible remote is skipped before any of its code runs.
 * - Isolation: one bad remote can't abort the others; outcomes are logged/returned.
 * - Every network step is time-budgeted: the app-runner awaits this loader before
 *   installing the router, so a hung remote is *bounded* — it degrades to failed/skipped
 *   within its budget rather than hanging boot forever. There are TWO budget knobs
 *   (manifestTimeoutMs, loadTimeoutMs — the latter bounds load and init separately),
 *   so one remote may legally take up to manifest + 2×load (defaults: 3s + 5s + 5s =
 *   13s). bootstrap.ts additionally holds a BOOT_BACKSTOP_MS above that sum — a true
 *   backstop that fires only when these budgets malfunction or the loader chunk fetch
 *   itself hangs; keep it > manifest + 2×load when changing the defaults here.
 * Discovery is env-driven (`APP_MODULES_FEDERATION_REMOTES`); the harness ships no built-in remote.
 */

/** The contract every federated plugin's `./plugin` expose must satisfy. */
interface IFederatedPlugin {
  init?: () => void | Promise<void>;
}

interface IRemoteDescriptor {
  name: string;
  entry: string;
}

/** Subset of the MF manifest the host reads before executing plugin code. */
interface IRemoteManifest {
  metaData?: {
    requiredHostVersion?: string;
  };
}

export interface IFederatedLoadResult {
  loaded: string[];
  failed: string[];
  /** Skipped because incompatible with this host, manifest unreadable, or the configured entry URL is invalid. */
  skipped: string[];
}

export interface IFederatedLoaderOptions {
  /** Budget for reading one remote's manifest JSON; exceeded => skipped (fail closed). */
  manifestTimeoutMs?: number;
  /**
   * Budget for the load phase AND (separately) the init phase of one remote;
   * exceeded => failed. When raising the defaults, keep bootstrap.ts's
   * BOOT_BACKSTOP_MS above manifestTimeoutMs + 2×loadTimeoutMs.
   */
  loadTimeoutMs?: number;
}

// Exported for the invariant test only (bootstrap's backstop must exceed their sum).
export const DEFAULT_MANIFEST_TIMEOUT_MS = 3_000;
export const DEFAULT_LOAD_TIMEOUT_MS = 5_000;

/** Distinguishes a budget expiry from the work's own failure (see raceWithLateLogging). */
class TimeoutError extends Error {}

async function withTimeout<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * withTimeout, plus: when the BUDGET (not the work) is what failed, the work keeps
 * running detached — its eventual settlement is logged either way, so a "failed"
 * outcome is never silently contradicted (late success) and the real cause of a late
 * failure is not discarded in favor of the synthetic timeout error. A work promise
 * that rejects on its own is NOT double-logged — the caller's catch owns that error.
 */
async function raceWithLateLogging<T>(work: Promise<T>, ms: number, label: string, lateNote: string): Promise<T> {
  try {
    return await withTimeout(work, ms, label);
  } catch (error) {
    if (error instanceof TimeoutError) {
      work
        .then(() => Logger.warn(`[MF] ${label} completed after its budget - ${lateNote}`))
        .catch((lateError) => Logger.warn(`[MF] ${label} failed after its budget`, lateError));
    }
    throw error;
  }
}

/**
 * Remote code executes with full app privileges, so the entry URL must not be
 * downgradable: https only, with http allowed solely for localhost development.
 * NOTE: this validates the MANIFEST url only. The manifest then declares its own
 * remoteEntry.js/chunk URLs, which loadRemote fetches as-is — they are NOT re-checked
 * here. The trust boundary is therefore the configured remote: whoever controls that
 * https manifest is trusted to point at code URLs of their choosing.
 */
function isAllowedRemoteUrl(entry: string): boolean {
  let url: URL;
  try {
    url = new URL(entry);
  } catch {
    return false;
  }
  if (url.protocol === "https:") {
    return true;
  }
  // URL.hostname keeps the brackets for IPv6 literals, hence "[::1]".
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
  return url.protocol === "http:" && isLocalhost;
}

interface IResolvedRemotes {
  remotes: IRemoteDescriptor[];
  /** Names whose configured entry failed validation — reported as `skipped`, never silently dropped. */
  invalidNames: string[];
}

/**
 * Parses and validates APP_MODULES_FEDERATION_REMOTES. The full entry-URL contract
 * lives HERE (a future discovery source must route through this function, not just
 * isAllowedRemoteUrl): the value must be a string, an allowed https/localhost URL, and
 * contain ".json" — the MF runtime decides manifest-vs-remoteEntry by that substring
 * (isPureRemoteEntry in @module-federation/runtime-core does `!entry.includes(".json")`),
 * so a manifest URL without it would pass the version gate (it fetches fine as JSON)
 * but then be <script>-loaded as JS by loadRemote — a SyntaxError far from the real
 * cause. Rejected here, at configuration time, with the real reason instead.
 */
function resolveRemotes(): IResolvedRemotes {
  const resolved: IResolvedRemotes = { remotes: [], invalidNames: [] };
  const raw = import.meta.env.APP_MODULES_FEDERATION_REMOTES;
  if (!raw) {
    // No remotes configured -> no-op. The harness carries no built-in remote.
    return resolved;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    Logger.error("[MF] APP_MODULES_FEDERATION_REMOTES is not valid JSON; ignoring", error);
    return resolved;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    Logger.error("[MF] APP_MODULES_FEDERATION_REMOTES must be a JSON object of remote name -> manifest URL; ignoring");
    return resolved;
  }

  for (const [name, value] of Object.entries(parsed)) {
    if (typeof value !== "string") {
      Logger.error(`[MF] Skipping remote "${name}": entry must be a string URL`);
      resolved.invalidNames.push(name);
      continue;
    }
    if (!isAllowedRemoteUrl(value)) {
      Logger.error(`[MF] Skipping remote "${name}": entry must be an https URL (http only for localhost)`);
      resolved.invalidNames.push(name);
      continue;
    }
    if (!/\.json/.test(value)) {
      Logger.error(
        `[MF] Skipping remote "${name}": entry must be a manifest JSON URL containing ".json" (e.g. .../mf-manifest.json) — the MF runtime script-loads other URLs as a remoteEntry`,
      );
      resolved.invalidNames.push(name);
      continue;
    }
    resolved.remotes.push({ name, entry: value });
  }
  return resolved;
}

/**
 * CONTRACT GATE (version gate 1 of 2 — see version-gate.ts and the README). Fetches
 * the remote manifest (plain JSON — no code execution) and checks its declared
 * `requiredHostVersion` (semver version or range) against the host's core version.
 * Skips on incompatibility, malformed requirement, manifest read failure, or
 * timeout — all fail closed. Shared-library versions (vue, apollo, ...) are guarded
 * separately by the SHARED-DEPENDENCY GATE at loadRemote() time.
 */
async function isCompatible(remote: IRemoteDescriptor, manifestTimeoutMs: number): Promise<boolean> {
  try {
    const readManifest = async (): Promise<IRemoteManifest> => {
      const response = await fetch(remote.entry, {
        headers: { accept: "application/json" },
        // Aborts the actual network request; withTimeout below bounds the whole step
        // even if a fetch implementation ignores the signal.
        signal: AbortSignal.timeout(manifestTimeoutMs),
      });
      if (!response.ok) {
        throw new Error(`manifest HTTP ${response.status}`);
      }
      return (await response.json()) as IRemoteManifest;
    };
    const manifest = await withTimeout(readManifest(), manifestTimeoutMs, `manifest fetch for "${remote.name}"`);

    const compatibility = checkHostCompatibility(CORE_VERSION, manifest.metaData?.requiredHostVersion);
    if (!compatibility.ok) {
      Logger.warn(`[MF] Skipping "${remote.name}": ${compatibility.reason}`);
      return false;
    }
    return true;
  } catch (error) {
    Logger.error(`[MF] Could not read/validate manifest for "${remote.name}" (${remote.entry})`, error);
    return false;
  }
}

/**
 * Log a summary so a vanished plugin is never silent during development (Logger is
 * live in dev builds and a no-op in production). NOTE: failed/skipped plugins leave
 * no prod signal yet — reporting them to Application Insights (exceptions for
 * `failed`, customEvents for `skipped`) is a tracked stage-2 follow-up: see TODO.md.
 */
function reportOutcome(result: IFederatedLoadResult): void {
  const { loaded, failed, skipped } = result;
  if (failed.length === 0 && skipped.length === 0) {
    // Happy path: no prod noise (Logger is a no-op in production builds). But a plugin
    // author running the prescribed local flow (build --mode=development + preview,
    // where Logger IS live) otherwise gets zero confirmation their remote loaded —
    // invisible for extension-point-only plugins that render no route. One positive
    // line closes that gap.
    if (loaded.length > 0) {
      Logger.info(`[MF] plugins loaded=[${loaded.join(", ")}]`);
    }
    return;
  }
  Logger.warn(`[MF] plugins loaded=${loaded.length} failed=[${failed.join(", ")}] skipped=[${skipped.join(", ")}]`);
}

/**
 * Registers and initializes every configured, compatible federated plugin. Resolves
 * once all have settled and returns the outcome. Never rejects — isolation is total.
 */
export async function initFederatedModules(options?: IFederatedLoaderOptions): Promise<IFederatedLoadResult> {
  const manifestTimeoutMs = options?.manifestTimeoutMs ?? DEFAULT_MANIFEST_TIMEOUT_MS;
  const loadTimeoutMs = options?.loadTimeoutMs ?? DEFAULT_LOAD_TIMEOUT_MS;

  const result: IFederatedLoadResult = { loaded: [], failed: [], skipped: [] };
  const { remotes, invalidNames } = resolveRemotes();
  // Config-invalid remotes count as skipped so they surface through the same loud
  // summary log as version-gate skips — never a silent drop.
  result.skipped.push(...invalidNames);
  if (remotes.length === 0) {
    if (result.skipped.length > 0) {
      reportOutcome(result);
    }
    return result;
  }

  // Version-gate everything before registering/executing any remote code.
  const compatibility = await Promise.all(
    remotes.map(async (remote) => ({ remote, ok: await isCompatible(remote, manifestTimeoutMs) })),
  );
  const compatible = compatibility.filter((entry) => entry.ok).map((entry) => entry.remote);
  compatibility.filter((entry) => !entry.ok).forEach((entry) => result.skipped.push(entry.remote.name));

  if (compatible.length === 0) {
    reportOutcome(result);
    return result;
  }

  try {
    registerRemotes(
      compatible.map((remote) => ({ name: remote.name, entry: remote.entry })),
      // Re-registering the same remote across HMR reloads must not throw.
      { force: true },
    );
  } catch (error) {
    // Registration is all-or-nothing, so a throw here fails every compatible remote at
    // once — but it must still resolve (not reject) to keep the "never rejects" contract.
    compatible.forEach((remote) => result.failed.push(remote.name));
    Logger.error("[MF] registerRemotes failed", error);
    reportOutcome(result);
    return result;
  }

  await Promise.allSettled(
    compatible.map(async (remote) => {
      try {
        // Load and init are raced SEPARATELY: a timed-out plugin's init() is never
        // invoked - the timeout is real containment for the init phase. Neither phase
        // can be CANCELLED though: a loadRemote that resolves after its budget has
        // still executed the remote's module scope (top-level side effects like a CSS
        // import), and an init() that started keeps running — raceWithLateLogging logs
        // both late settlements so the "failed" outcome is never silently contradicted.
        const plugin = await raceWithLateLogging(
          loadRemote<IFederatedPlugin>(`${remote.name}/plugin`),
          loadTimeoutMs,
          `plugin "${remote.name}" load`,
          "its module scope has executed (init() is NOT called); state is indeterminate",
        );
        // The MF runtime resolves null instead of rejecting when an errorLoadRemote
        // failover hook is registered. None is today, but "no module delivered"
        // must never count (silently) as loaded if one ever appears.
        if (plugin === null) {
          throw new Error(`plugin "${remote.name}" load resolved to null - no module was delivered`);
        }
        if (plugin.init) {
          await raceWithLateLogging(
            Promise.resolve(plugin.init()),
            loadTimeoutMs,
            `plugin "${remote.name}" init`,
            "state is indeterminate",
          );
        }
        result.loaded.push(remote.name);
      } catch (error) {
        result.failed.push(remote.name);
        Logger.error(`[MF] Failed to load federated plugin "${remote.name}"`, error);
      }
    }),
  );

  reportOutcome(result);
  return result;
}
