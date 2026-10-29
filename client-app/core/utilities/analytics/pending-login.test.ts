import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createPendingLogin } from "./pending-login";

const STORAGE_KEY = "vc-test-pending-login";

describe("createPendingLogin", () => {
  const send = vi.fn();
  let deferLogin: ReturnType<typeof createPendingLogin>["deferLogin"];
  let sendPendingLogin: ReturnType<typeof createPendingLogin>["sendPendingLogin"];

  beforeEach(() => {
    send.mockReset();
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-09T10:00:00Z"));
    ({ deferLogin, sendPendingLogin } = createPendingLogin({ storageKey: STORAGE_KEY, send }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("is kept under the given key for the next page instead of being sent from this one", () => {
    deferLogin("password", { success: true });

    expect(send).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("is sent once, by the signed-in page, and never again", () => {
    deferLogin("password", { success: true });

    sendPendingLogin(true);
    sendPendingLogin(true);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("password", { success: true });
    expect(sessionStorage).toHaveLength(0);
  });

  // Removed before the send: a send that throws must not leave it behind to fire on every later page.
  it("is gone even when sending it throws", () => {
    deferLogin("password", { success: true });
    send.mockImplementationOnce(() => {
      throw new Error("tracker failed");
    });

    expect(() => sendPendingLogin(true)).toThrow("tracker failed");
    sendPendingLogin(true);

    expect(send).toHaveBeenCalledTimes(1);
    expect(sessionStorage).toHaveLength(0);
  });

  it("is dropped, not sent, by a page that is not signed in", () => {
    deferLogin("password", { success: true });

    sendPendingLogin(false);
    sendPendingLogin(true);

    expect(send).not.toHaveBeenCalled();
    expect(sessionStorage).toHaveLength(0);
  });

  it("is sent by a page that loads two minutes after the sign-in", () => {
    deferLogin("password", { success: true });

    vi.setSystemTime(new Date("2026-10-09T10:02:00Z"));
    sendPendingLogin(true);

    expect(send).toHaveBeenCalledTimes(1);
  });

  // "Reopen closed tab" restores session storage: an old sign-in must not be replayed as a new one.
  it("is dropped by a page that loads later than that", () => {
    deferLogin("password", { success: true });

    vi.setSystemTime(new Date("2026-10-09T10:02:00.001Z"));
    sendPendingLogin(true);

    expect(send).not.toHaveBeenCalled();
    expect(sessionStorage).toHaveLength(0);
  });

  // A step after the token can fail and leave the visitor on the form: no reload comes to send it.
  it("is sent by the sign-in page itself when no reload comes within ten seconds", () => {
    deferLogin("password", { success: true });

    vi.advanceTimersByTime(9_999);
    expect(send).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("password", { success: true });
    expect(sessionStorage).toHaveLength(0);
  });

  it("waits ten seconds from the latest attempt, not the first", () => {
    deferLogin("password", { success: true });
    vi.advanceTimersByTime(8_000);
    deferLogin("password", { success: true });

    vi.advanceTimersByTime(2_000);
    expect(send).not.toHaveBeenCalled();

    vi.advanceTimersByTime(8_000);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("is not sent again by the sign-in page once the next page has sent it", () => {
    deferLogin("password", { success: true });

    sendPendingLogin(true);
    vi.advanceTimersByTime(10_000);

    expect(send).toHaveBeenCalledTimes(1);
  });

  it("sends nothing when there is nothing pending", () => {
    sendPendingLogin(true);

    expect(send).not.toHaveBeenCalled();
  });

  it("falls back to sending at once when it cannot be stored", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    deferLogin("password", { success: true });
    vi.advanceTimersByTime(10_000);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("password", { success: true });
  });

  // Two trackers, two keys: one tracker's page must not take the other's login.
  it("keeps the logins of two instances apart", () => {
    const otherSend = vi.fn();
    const other = createPendingLogin({ storageKey: "vc-other-pending-login", send: otherSend });

    deferLogin("password", { success: true });
    other.sendPendingLogin(true);

    expect(otherSend).not.toHaveBeenCalled();
    sendPendingLogin(true);
    expect(send).toHaveBeenCalledTimes(1);
  });
});
