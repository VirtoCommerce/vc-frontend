import { loadRemote, registerRemotes } from "@module-federation/enhanced/runtime";
import { compareVersions, Logger } from "@/core/utilities";
import { CORE_VERSION } from "@/core-api/version";
import { useNotifications } from "@/shared/notification";

/**
 * Host-side loader for Module Federation plugins (VCST-5159).
 *
 * Runtime discovery instead of static `import`: for each configured remote, read its
 * manifest, version-check it, `loadRemote` its `./plugin` expose, and call its `init()`
 * hook. Plugins bind to the host's live router/i18n/etc. through the shared
 * `@vc-frontend/core` facade, so nothing is passed in.
 *
 * Guarantees:
 * - Version safety (#2): a remote is skipped BEFORE any of its code runs if its
 *   declared `requiredHostVersion` isn't satisfied by this host's core version.
 * - Isolation (#8): one failing/incompatible remote can't abort the others or boot;
 *   outcomes are logged, surfaced in dev, and returned for telemetry.
 *
 * Route registration timing (#4) is handled by the caller: `app-runner` awaits this
 * before installing the router, so plugin routes exist for the initial navigation
 * (no 404 flash, no post-hoc re-navigation).
 *
 * Discovery source for the MVP is env (`APP_MF_REMOTES`, a JSON map of
 * `{ [remoteName]: manifestUrl }`) with a localhost dev default. Production should
 * feed this from the `InitializeApplication` module manifest once it carries an
 * entry URL per module.
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

function resolveRemotes(): IRemoteDescriptor[] {
  const raw = import.meta.env.APP_MF_REMOTES as string | undefined;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      return Object.entries(parsed).map(([name, entry]) => ({ name, entry }));
    } catch (error) {
      Logger.error("[MF] APP_MF_REMOTES is not valid JSON; ignoring", error);
    }
  }
  // Dev default: the news-plugin remote (examples/news-plugin) served on :3001.
  // https so an https host doesn't hit mixed-content blocking loading the remote.
  return [{ name: "news", entry: "https://localhost:3001/mf-manifest.json" }];
}

/**
 * Version gate (#2). Fetches the remote manifest (plain JSON — no code execution) and
 * checks its declared `requiredHostVersion` against the host's core version. Returns
 * false (skip) on incompatibility OR when the manifest can't be read (fail closed).
 */
async function isCompatible(remote: IRemoteDescriptor): Promise<boolean> {
  try {
    const response = await fetch(remote.entry, { headers: { accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`manifest HTTP ${response.status}`);
    }
    const manifest = (await response.json()) as IRemoteManifest;
    const required = manifest.metaData?.requiredHostVersion;
    if (required && compareVersions(CORE_VERSION, required) < 0) {
      Logger.warn(
        `[MF] Skipping "${remote.name}": requires @vc-frontend/core >= ${required}, host provides ${CORE_VERSION}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    Logger.error(`[MF] Could not read/validate manifest for "${remote.name}" (${remote.entry})`, error);
    return false;
  }
}

/** Log + (in dev) surface a summary so a vanished plugin is never silent (#8). */
function reportOutcome(result: IFederatedLoadResult): void {
  const { loaded, failed, skipped } = result;
  if (failed.length === 0 && skipped.length === 0) {
    return;
  }
  Logger.warn(`[MF] plugins loaded=${loaded.length} failed=[${failed.join(", ")}] skipped=[${skipped.join(", ")}]`);
  // Prod: these failures should also be routed to AppInsights trackException.
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
export async function initFederatedModules(): Promise<IFederatedLoadResult> {
  const result: IFederatedLoadResult = { loaded: [], failed: [], skipped: [] };
  const remotes = resolveRemotes();
  if (remotes.length === 0) {
    return result;
  }

  // Version-gate everything before registering/executing any remote code.
  const compatibility = await Promise.all(remotes.map(async (remote) => ({ remote, ok: await isCompatible(remote) })));
  const compatible = compatibility.filter((entry) => entry.ok).map((entry) => entry.remote);
  compatibility.filter((entry) => !entry.ok).forEach((entry) => result.skipped.push(entry.remote.name));

  if (compatible.length === 0) {
    reportOutcome(result);
    return result;
  }

  registerRemotes(
    compatible.map((remote) => ({ name: remote.name, entry: remote.entry })),
    // Re-registering the same remote across HMR reloads must not throw.
    { force: true },
  );

  await Promise.allSettled(
    compatible.map(async (remote) => {
      try {
        const plugin = await loadRemote<IFederatedPlugin>(`${remote.name}/plugin`);
        await plugin?.init?.();
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
