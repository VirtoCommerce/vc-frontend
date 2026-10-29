import { describe, it, expect, beforeEach, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  captureMock: vi.fn(),
}));

vi.mock("./client", () => ({
  capture: hoisted.captureMock,
}));

const { deferLogin, sendPendingLogin } = await import("./pending-login");
const { PENDING_LOGIN_STORAGE_KEY } = await import("./constants");

describe("posthog pending login", () => {
  beforeEach(() => {
    hoisted.captureMock.mockReset();
    sessionStorage.clear();
  });

  it("keeps the login under its own key and sends it as a login capture", () => {
    deferLogin("password", { success: true });

    expect(sessionStorage.getItem(PENDING_LOGIN_STORAGE_KEY)).not.toBeNull();
    expect(hoisted.captureMock).not.toHaveBeenCalled();

    sendPendingLogin(true);

    expect(hoisted.captureMock).toHaveBeenCalledWith("login", { success: true, method: "password" });
  });
});
