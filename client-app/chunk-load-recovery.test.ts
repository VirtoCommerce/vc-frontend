import { beforeAll, beforeEach, afterEach, describe, expect, test, vi } from "vitest";
import { BOOT_SETTLE_DELAY, installChunkLoadRecovery } from "@/chunk-load-recovery";
import { setGlobals } from "@/core/globals";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { useNotifications } from "@/shared/notification";
import type { I18n } from "@/i18n";

const reload = vi.fn();

function dispatchPreloadError(payload = new Error("Unable to preload CSS for /assets/chunk-abc123.js")) {
  const event = new Event("vite:preloadError", { cancelable: true }) as VitePreloadErrorEvent;
  event.payload = payload;

  window.dispatchEvent(event);

  return event;
}

/** Runs the deferred decision without giving boot the chance to finish. */
function settleDecision(): void {
  vi.advanceTimersByTime(0);
}

function settleBoot(): void {
  vi.advanceTimersByTime(BOOT_SETTLE_DELAY);
}

function renderApplication(): void {
  document.querySelector("#app")!.appendChild(document.createElement("div"));
}

describe("installChunkLoadRecovery", () => {
  beforeAll(() => {
    setGlobals({ i18n: { global: { t: (key: string) => key } } as unknown as I18n });
    installChunkLoadRecovery();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("location", { reload });
    document.body.innerHTML = `<div id="app"></div>`;
    sessionStorage.clear();
    useNotifications().clear();
    reload.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // A rendered application can explain itself, so the user keeps control over when the page reloads
  // — an unannounced reload would discard whatever they were typing.
  test("offers a reload instead of forcing one when the application is rendered", () => {
    renderApplication();

    dispatchPreloadError();
    settleDecision();

    const { stack } = useNotifications();

    expect(reload).not.toHaveBeenCalled();
    expect(stack.value).toHaveLength(1);
    expect(stack.value[0]).toMatchObject({
      type: "danger",
      group: "ChunkLoadError",
      text: "common.messages.content_failed_to_load",
      button: { text: "common.buttons.reload_page" },
    });
  });

  test("reloads the page when the failure happens before the application renders", () => {
    dispatchPreloadError();
    settleDecision();
    settleBoot();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(useNotifications().stack.value).toHaveLength(0);
  });

  // A chunk that is permanently missing keeps failing after the reload; reloading again on every
  // failure would trap the tab in a loop.
  test("does not reload again while the previous automatic reload is still recent", () => {
    dispatchPreloadError();
    settleDecision();
    settleBoot();

    dispatchPreloadError();
    settleDecision();
    settleBoot();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  test("reloads again once the cooldown has passed", () => {
    dispatchPreloadError();
    settleDecision();
    settleBoot();

    vi.advanceTimersByTime(10001);

    dispatchPreloadError();
    settleDecision();
    settleBoot();

    expect(reload).toHaveBeenCalledTimes(2);
  });

  // The storefront also runs inside preview iframes, where storage access can be denied. Without a
  // record of the previous attempt there is no way to keep the reload from looping.
  test("does not reload when storage is unavailable", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new DOMException("denied", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("denied", "SecurityError");
      },
    });

    dispatchPreloadError();

    expect(() => {
      settleDecision();
      settleBoot();
    }).not.toThrow();
    expect(reload).not.toHaveBeenCalled();
  });

  // Preventing the event makes the failed import resolve with `undefined` instead of rejecting,
  // which hides the failure from Vue and the router.
  test("leaves the event un-prevented so the import still rejects", () => {
    renderApplication();

    expect(dispatchPreloadError().defaultPrevented).toBe(false);
  });

  // Several imports degrade on purpose — an optional preview plugin, a locale bundle that falls back
  // to English. Reacting to those would replace a working boot with a reload or a false alarm.
  test("stays silent about a failure the call site has claimed", () => {
    renderApplication();

    const error = new Error("Failed to fetch dynamically imported module: /assets/plugin-abc123.js");

    ignoreChunkLoadFailure(error);
    dispatchPreloadError(error);
    settleDecision();
    settleBoot();

    expect(useNotifications().stack.value).toHaveLength(0);
    expect(reload).not.toHaveBeenCalled();
  });

  test("does not reload for a claimed failure that happens before the application renders", () => {
    const error = new Error("Failed to fetch dynamically imported module: /assets/en-abc123.js");

    ignoreChunkLoadFailure(error);
    dispatchPreloadError(error);
    settleDecision();
    settleBoot();

    expect(reload).not.toHaveBeenCalled();
  });

  // Vite dispatches the event and rethrows the same error, so the call site's own handler runs one
  // microtask later — the decision has to wait for it rather than read the claim too early.
  test("lets a call site claim the failure in its own catch handler", async () => {
    const error = new Error("Failed to fetch dynamically imported module: /assets/plugin-abc123.js");
    const load = Promise.reject(error).catch(ignoreChunkLoadFailure);

    dispatchPreloadError(error);
    await load;

    settleDecision();
    settleBoot();

    expect(reload).not.toHaveBeenCalled();
  });

  // The failed chunk may be one boot can finish without, and the check runs before that is known.
  test("does not reload when the application renders after the failure", () => {
    dispatchPreloadError();
    settleDecision();

    renderApplication();
    settleBoot();

    expect(reload).not.toHaveBeenCalled();
  });
});
