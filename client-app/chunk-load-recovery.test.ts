import { beforeAll, beforeEach, afterEach, describe, expect, test, vi } from "vitest";
import { installChunkLoadRecovery } from "@/chunk-load-recovery";
import { setGlobals } from "@/core/globals";
import { useNotifications } from "@/shared/notification";
import type { I18n } from "@/i18n";

const reload = vi.fn();

function dispatchPreloadError(): VitePreloadErrorEvent {
  const event = new Event("vite:preloadError", { cancelable: true }) as VitePreloadErrorEvent;
  event.payload = new Error("Unable to preload CSS for /assets/chunk-abc123.js");

  window.dispatchEvent(event);

  return event;
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
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("location", { reload });
    document.body.innerHTML = `<div id="app"></div>`;
    sessionStorage.clear();
    useNotifications().clear();
    reload.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // A rendered application can explain itself, so the user keeps control over when the page reloads
  // — an unannounced reload would discard whatever they were typing.
  test("offers a reload instead of forcing one when the application is rendered", () => {
    renderApplication();

    dispatchPreloadError();

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

    expect(reload).toHaveBeenCalledTimes(1);
    expect(useNotifications().stack.value).toHaveLength(0);
  });

  // A chunk that is permanently missing keeps failing after the reload; reloading again on every
  // failure would trap the tab in a loop.
  test("does not reload again while the previous automatic reload is still recent", () => {
    dispatchPreloadError();
    dispatchPreloadError();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  test("reloads again once the cooldown has passed", () => {
    dispatchPreloadError();

    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 10001);
    dispatchPreloadError();

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

    expect(() => dispatchPreloadError()).not.toThrow();
    expect(reload).not.toHaveBeenCalled();
  });

  // Preventing the event makes the failed import resolve with `undefined` instead of rejecting,
  // which hides the failure from Vue and the router.
  test("leaves the event un-prevented so the import still rejects", () => {
    renderApplication();

    expect(dispatchPreloadError().defaultPrevented).toBe(false);
  });
});
