import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities/logger";
import { isIgnoredChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { useNotifications } from "@/shared/notification";

const APP_SELECTOR = "#app";
const AUTO_RELOAD_TIMESTAMP_KEY = "chunk-load-auto-reload";
const AUTO_RELOAD_COOLDOWN = 10000;
export const BOOT_SETTLE_DELAY = 3000;

let installed = false;

/**
 * Recovers from a chunk that can no longer be fetched. The usual cause is a deploy while the tab is
 * open: every chunk is renamed by its new content hash, so the filenames the loaded document knows
 * about start responding with 404.
 *
 * Vite dispatches `vite:preloadError` for every failed dynamic import — lazy routes,
 * `defineAsyncComponent`, and plain `import()` alike — so a single listener covers all of them.
 * `defineAsyncComponent` caches the rejected loader promise and replays it on every later mount,
 * which leaves a fresh document as the only recovery.
 */
export function installChunkLoadRecovery(): void {
  if (installed) {
    return;
  }

  installed = true;

  window.addEventListener("vite:preloadError", (event) => {
    const { payload } = event;

    // The event is left un-prevented: preventing it makes the import resolve with `undefined`
    // instead of rejecting, which hides the failure from Vue and the router.
    //
    // Vite rethrows `payload` right after dispatching, so a call site that degrades on its own gets
    // it one microtask later. Deciding on the next macrotask gives that handler its turn to claim
    // the failure, instead of reacting to an import that was always allowed to fail.
    setTimeout(() => recover(payload));
  });
}

function recover(error: Error): void {
  if (isIgnoredChunkLoadFailure(error)) {
    return;
  }

  Logger.error("Failed to load an application chunk.", error);

  if (isApplicationRendered()) {
    notifyLoadFailure();
    return;
  }

  // Boot may still finish without the failed chunk — an optional plugin, a locale bundle. Reload only
  // if nothing rendered by then, so a degrading import never costs the user a page load.
  setTimeout(() => {
    if (!isApplicationRendered()) {
      reloadOnce();
    }
  }, BOOT_SETTLE_DELAY);
}

function isApplicationRendered(): boolean {
  return !!document.querySelector(APP_SELECTOR)?.hasChildNodes();
}

function notifyLoadFailure(): void {
  const { t } = globals.i18n.global;

  useNotifications().error({
    group: "ChunkLoadError",
    singleInGroup: true,
    variant: "outline-dark",
    text: t("common.messages.content_failed_to_load"),
    button: {
      text: t("common.buttons.reload_page"),
      color: "secondary",
      variant: "outline",
      clickHandler: () => location.reload(),
    },
  });
}

/**
 * Before the application renders there is nothing to show a notification in, so reloading is the only
 * recovery left. The timestamp keeps a permanently missing chunk from turning that into a reload loop.
 */
function reloadOnce(): void {
  try {
    const lastReloadAt = Number(sessionStorage.getItem(AUTO_RELOAD_TIMESTAMP_KEY));

    if (lastReloadAt && Date.now() - lastReloadAt < AUTO_RELOAD_COOLDOWN) {
      return;
    }

    sessionStorage.setItem(AUTO_RELOAD_TIMESTAMP_KEY, String(Date.now()));
  } catch {
    // Storage access throws where it is denied — a sandboxed preview iframe, blocked cookies.
    // Without a record of the previous attempt the reload cannot be kept from looping, so skip it.
    return;
  }

  location.reload();
}
