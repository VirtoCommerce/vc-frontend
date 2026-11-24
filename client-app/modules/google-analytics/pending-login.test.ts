import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  sendEventMock: vi.fn(),
}));

vi.mock("./utils", () => ({
  sendEvent: hoisted.sendEventMock,
}));

const { deferLogin, sendPendingLogin } = await import("./pending-login");

describe("pending login", () => {
  beforeEach(() => {
    hoisted.sendEventMock.mockReset();
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-09T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("is kept for the next page instead of being sent from this one", () => {
    deferLogin("password", { success: true });

    expect(hoisted.sendEventMock).not.toHaveBeenCalled();
    expect(sessionStorage).toHaveLength(1);
  });

  it("is sent once, by the signed-in page, and never again", () => {
    deferLogin("password", { success: true });

    sendPendingLogin(true);
    sendPendingLogin(true);

    expect(hoisted.sendEventMock).toHaveBeenCalledTimes(1);
    expect(hoisted.sendEventMock).toHaveBeenCalledWith("login", { success: true, method: "password" });
    expect(sessionStorage).toHaveLength(0);
  });

  // Removed before the send: a send that throws must not leave it behind to fire on every later page.
  it("is gone even when sending it throws", () => {
    deferLogin("password", { success: true });
    hoisted.sendEventMock.mockImplementationOnce(() => {
      throw new Error("gtag failed");
    });

    expect(() => sendPendingLogin(true)).toThrow("gtag failed");
    sendPendingLogin(true);

    expect(hoisted.sendEventMock).toHaveBeenCalledTimes(1);
    expect(sessionStorage).toHaveLength(0);
  });

  it("is dropped, not sent, by a page that is not signed in", () => {
    deferLogin("password", { success: true });

    sendPendingLogin(false);
    sendPendingLogin(true);

    expect(hoisted.sendEventMock).not.toHaveBeenCalled();
    expect(sessionStorage).toHaveLength(0);
  });

  it("is sent by a page that loads two minutes after the sign-in", () => {
    deferLogin("password", { success: true });

    vi.setSystemTime(new Date("2026-10-09T10:02:00Z"));
    sendPendingLogin(true);

    expect(hoisted.sendEventMock).toHaveBeenCalledTimes(1);
  });

  // "Reopen closed tab" restores session storage: an old sign-in must not be replayed as a new one.
  it("is dropped by a page that loads later than that", () => {
    deferLogin("password", { success: true });

    vi.setSystemTime(new Date("2026-10-09T10:02:00.001Z"));
    sendPendingLogin(true);

    expect(hoisted.sendEventMock).not.toHaveBeenCalled();
    expect(sessionStorage).toHaveLength(0);
  });

  // A step after the token can fail and leave the visitor on the form: no reload comes to send it.
  it("is sent by the sign-in page itself when no reload comes within ten seconds", () => {
    deferLogin("password", { success: true });

    vi.advanceTimersByTime(9_999);
    expect(hoisted.sendEventMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(hoisted.sendEventMock).toHaveBeenCalledTimes(1);
    expect(hoisted.sendEventMock).toHaveBeenCalledWith("login", { success: true, method: "password" });
    expect(sessionStorage).toHaveLength(0);
  });

  // A retry soon after a failed step: the first attempt's timer must not take the retry's login, under the signed-out
  // identity, while the retry's reload is on the way.
  it("waits ten seconds from the latest attempt, not the first", () => {
    deferLogin("password", { success: true });
    vi.advanceTimersByTime(8_000);
    deferLogin("password", { success: true });

    vi.advanceTimersByTime(2_000);
    expect(hoisted.sendEventMock).not.toHaveBeenCalled();
    expect(sessionStorage).toHaveLength(1);

    vi.advanceTimersByTime(8_000);
    expect(hoisted.sendEventMock).toHaveBeenCalledTimes(1);
  });

  it("is not sent again by the sign-in page once the next page has sent it", () => {
    deferLogin("password", { success: true });

    sendPendingLogin(true);
    vi.advanceTimersByTime(10_000);

    expect(hoisted.sendEventMock).toHaveBeenCalledTimes(1);
  });

  it("sends nothing when there is nothing pending", () => {
    sendPendingLogin(true);

    expect(hoisted.sendEventMock).not.toHaveBeenCalled();
  });

  it("falls back to sending at once when it cannot be stored", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    deferLogin("password", { success: true });
    vi.advanceTimersByTime(10_000);

    expect(hoisted.sendEventMock).toHaveBeenCalledTimes(1);
    expect(hoisted.sendEventMock).toHaveBeenCalledWith("login", { success: true, method: "password" });
  });
});
