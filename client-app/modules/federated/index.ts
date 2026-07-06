import { loadRemote, registerRemotes } from "@module-federation/enhanced/runtime";
import { getAppInsightsWhenReady } from "@/core/plugins/applicationInsights.plugin";
import { Logger } from "@/core/utilities";
import { version as CORE_VERSION } from "@/core-api/package.json";
import { useNotifications } from "@/shared/notification";
import { checkHostCompatibility } from "./version-gate";

/**
 * Host-side loader for Module Federation plugins. For each configured
 * remote: read its manifest, version-check it, `loadRemote` its `./plugin` expose, and
 * call `init()`. Plugins bind to the host's live services via the shared facade.
 * - Version safety: an incompatible remote is skipped before any of its code runs.
 * - Isolation: one bad remote can't abort the others; outcomes are logged/returned.
 * - Every network step is time-budgeted: the app-runner awaits this loader before
 *   installing the router, so a hung remote is *bounded* — it degrades to failed/skipped
 *   within its budget rather than hanging boot forever. It does still delay first paint by
 *   up to manifestTimeout + loadTimeout + initTimeout in the worst case, so keep budgets
 *   tight (defaults: 5s manifest, 10s load, 10s init).
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
  /** Skipped because incompatible with this host, or manifest unreadable. */
  skipped: string[];
}

export interface IFederatedLoaderOptions {
  /** Budget for reading one remote's manifest JSON; exceeded => skipped (fail closed). */
  manifestTimeoutMs?: number;
  /** Budget for loading + init()ing one remote; exceeded => failed. */
  loadTimeoutMs?: number;
}

const DEFAULT_MANIFEST_TIMEOUT_MS = 5_000;
const DEFAULT_LOAD_TIMEOUT_MS = 10_000;

async function withTimeout<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer);
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

function resolveRemotes(): IRemoteDescriptor[] {
  const raw = import.meta.env.APP_MODULES_FEDERATION_REMOTES;
  if (!raw) {
    // No remotes configured -> no-op. The harness carries no built-in remote.
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    Logger.error("[MF] APP_MODULES_FEDERATION_REMOTES is not valid JSON; ignoring", error);
    return [];
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    Logger.error("[MF] APP_MODULES_FEDERATION_REMOTES must be a JSON object of remote name -> manifest URL; ignoring");
    return [];
  }

  const remotes: IRemoteDescriptor[] = [];
  for (const [name, entry] of Object.entries(parsed)) {
    if (typeof entry !== "string" || !isAllowedRemoteUrl(entry)) {
      Logger.error(`[MF] Ignoring remote "${name}": entry must be an https URL (http only for localhost)`);
      continue;
    }
    remotes.push({ name, entry });
  }
  return remotes;
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
 * Routes failed/skipped plugins to Application Insights so a plugin that vanishes in
 * production is observable, not just a console line. Best-effort: no-op when
 * AppInsights is not configured for the store (console logging still covers it).
 */
function trackOutcome(result: IFederatedLoadResult): void {
  const entries = [
    ...result.failed.map((name) => ({ name, outcome: "failed" })),
    ...result.skipped.map((name) => ({ name, outcome: "skipped" })),
  ];
  if (entries.length === 0) {
    return;
  }
  // AppInsights installs and finishes loading asynchronously - after this loader has
  // already run at boot - so resolve it lazily and report once it is ready, rather than
  // reading undefined and dropping the telemetry. Fire-and-forget: best-effort
  // observability must never block boot (the app-runner awaits the loader before the
  // router installs).
  void getAppInsightsWhenReady()
    .then((appInsights) => {
      if (!appInsights) {
        return;
      }
      for (const entry of entries) {
        appInsights.trackException({
          exception: new Error(`[MF] federated plugin "${entry.name}" ${entry.outcome}`),
          properties: { pluginName: entry.name, outcome: entry.outcome, hostCoreVersion: CORE_VERSION },
        });
      }
    })
    // Telemetry is best-effort: a throw from trackException must not become an
    // unhandled rejection (this runs detached from the awaited loader promise).
    .catch((error) => Logger.error("[MF] failed to report plugin outcomes to Application Insights", error));
}

/** Log + track + (in dev) surface a summary so a vanished plugin is never silent. */
function reportOutcome(result: IFederatedLoadResult): void {
  const { loaded, failed, skipped } = result;
  if (failed.length === 0 && skipped.length === 0) {
    // Happy path: no AppInsights exception, no prod noise (Logger is a no-op in
    // production builds). But a plugin author running the prescribed local flow
    // (build --mode=development + preview, where Logger IS live) otherwise gets zero
    // confirmation their remote loaded — invisible for extension-point-only plugins
    // that render no route. One positive line closes that gap.
    if (loaded.length > 0) {
      Logger.info(`[MF] plugins loaded=[${loaded.join(", ")}]`);
    }
    return;
  }
  Logger.warn(`[MF] plugins loaded=${loaded.length} failed=[${failed.join(", ")}] skipped=[${skipped.join(", ")}]`);
  trackOutcome(result);
  if (import.meta.env.DEV) {
    useNotifications().error({
      text: `Module Federation: ${failed.length} plugin(s) failed, ${skipped.length} skipped (incompatible). See console.`,
      single: false,
    });
  }
}

/**
 * Registers and initializes every configured, compatible federated plugin. Resolves
 * once all have settled and returns the outcome. Never rejects — isolation is total.
 */
export async function initFederatedModules(options?: IFederatedLoaderOptions): Promise<IFederatedLoadResult> {
  const manifestTimeoutMs = options?.manifestTimeoutMs ?? DEFAULT_MANIFEST_TIMEOUT_MS;
  const loadTimeoutMs = options?.loadTimeoutMs ?? DEFAULT_LOAD_TIMEOUT_MS;

  const result: IFederatedLoadResult = { loaded: [], failed: [], skipped: [] };
  const remotes = resolveRemotes();
  if (remotes.length === 0) {
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
        // Load and init are raced SEPARATELY: a loadRemote that resolves after its
        // budget has nothing chained to it, so a timed-out plugin's init() is never
        // invoked - the timeout is real containment for the side-effecting phase.
        const plugin = await withTimeout(
          loadRemote<IFederatedPlugin>(`${remote.name}/plugin`),
          loadTimeoutMs,
          `plugin "${remote.name}" load`,
        );
        if (plugin?.init) {
          // An init() that already STARTED cannot be cancelled. If it outlives its
          // budget the plugin is reported failed, and its eventual completion is
          // logged so the "failed" outcome is never silently contradicted later.
          const initWork = Promise.resolve(plugin.init());
          try {
            await withTimeout(initWork, loadTimeoutMs, `plugin "${remote.name}" init`);
          } catch (error) {
            initWork
              .then(() =>
                Logger.warn(`[MF] plugin "${remote.name}" init completed after its budget - state is indeterminate`),
              )
              .catch(() => {});
            throw error;
          }
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
