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
 * Recovers from a chunk that can no longer be fetched — usually a deploy while the tab is open, which
 * renames every chunk by its new content hash.
 *
 * Vite dispatches `vite:preloadError` for every failed dynamic import, so one listener covers lazy
 * routes, `defineAsyncComponent` and plain `import()` alike.
 */
export function installChunkLoadRecovery(): void {
  if (installed) {
    return;
  }

  installed = true;

  window.addEventListener("vite:preloadError", (event) => {
    const { payload } = event;

    // Left un-prevented so the import still rejects. Vite rethrows `payload` right after dispatching,
    // so deferring lets a call site's own `.catch()` claim the failure first.
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

  // Boot may still finish without the failed chunk, so reload only if nothing rendered by then.
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

/** The timestamp keeps a permanently missing chunk from turning the reload into a loop. */
function reloadOnce(): void {
  try {
    const lastReloadAt = Number(sessionStorage.getItem(AUTO_RELOAD_TIMESTAMP_KEY));

    if (lastReloadAt && Date.now() - lastReloadAt < AUTO_RELOAD_COOLDOWN) {
      return;
    }

    sessionStorage.setItem(AUTO_RELOAD_TIMESTAMP_KEY, String(Date.now()));
  } catch {
    // Storage is denied in sandboxed preview iframes, leaving the reload unbounded.
    return;
  }

  location.reload();
}
