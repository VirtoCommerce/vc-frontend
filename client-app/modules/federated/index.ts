import { loadRemote, registerRemotes } from "@module-federation/enhanced/runtime";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";

/**
 * Host-side loader for Module Federation plugins (VCST-5159).
 *
 * Replaces the static `import { init } from "@/modules/xxx"` + `init(...)` wiring
 * with runtime discovery: register each remote's manifest, `loadRemote` its
 * `./plugin` expose, and call its `init()` hook. Plugins bind to the host's live
 * router/i18n/etc. through the shared `@vc-frontend/core` facade, so nothing is
 * passed in. Each plugin is isolated — a failing remote can never break app boot.
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
 * Registers and initializes every configured federated plugin. Resolves once all
 * plugins have settled; individual failures are logged and swallowed so one bad
 * remote cannot abort the others or the host.
 */
export async function initFederatedModules(): Promise<void> {
  const remotes = resolveRemotes();
  if (remotes.length === 0) {
    return;
  }

  registerRemotes(
    remotes.map((remote) => ({ name: remote.name, entry: remote.entry })),
    // Re-registering the same remote across HMR reloads must not throw.
    { force: true },
  );

  const results = await Promise.allSettled(
    remotes.map(async (remote) => {
      try {
        const plugin = await loadRemote<IFederatedPlugin>(`${remote.name}/plugin`);
        await plugin?.init?.();
      } catch (error) {
        Logger.error(`[MF] Failed to load federated plugin "${remote.name}"`, error);
        throw error;
      }
    }),
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) {
    Logger.warn(`[MF] ${failed}/${remotes.length} federated plugin(s) failed to load`);
  }

  // Deep-link fix: remotes register their routes asynchronously, so the router's
  // INITIAL navigation may have resolved to the 404 fallback before they loaded
  // (a hard load / deep link to a plugin route). If the current location now
  // matches a freshly-registered route, re-resolve it so the correct page renders.
  const { router } = globals;
  const current = router.currentRoute.value;
  const resolved = router.resolve(current.fullPath);
  if (resolved.matched.length > 0 && resolved.name !== current.name) {
    await router.replace(resolved.fullPath);
  }
}
