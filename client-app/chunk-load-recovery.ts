import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities/logger";
import { useNotifications } from "@/shared/notification";

const APP_SELECTOR = "#app";
const AUTO_RELOAD_TIMESTAMP_KEY = "chunk-load-auto-reload";
const AUTO_RELOAD_COOLDOWN = 10000;

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
    Logger.error("Failed to load an application chunk.", event.payload);

    // The event is left un-prevented: preventing it makes the import resolve with `undefined`
    // instead of rejecting, which hides the failure from Vue and the router.
    if (isApplicationRendered()) {
      notifyLoadFailure();
    } else {
      reloadOnce();
    }
  });
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
