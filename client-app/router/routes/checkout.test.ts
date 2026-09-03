import { describe, expect, test, vi } from "vitest";
import { checkoutRoutes } from "./checkout";
import { ROUTES } from "./constants";
import { UcpHandoffRestoreError } from "./ucp-handoff";
import type { NavigationGuard, RouteLocationNormalized } from "vue-router";

const handoff = vi.hoisted(() => ({
  restore: vi.fn(),
}));

vi.mock("./ucp-handoff", () => ({
  applyUcpHandoffBuyer: vi.fn(),
  restoreUcpHandoffCart: handoff.restore,
  UcpHandoffRestoreError: class MockUcpHandoffRestoreError extends Error {
    constructor(
      message: string,
      public readonly status: number,
    ) {
      super(message);
      this.name = "UcpHandoffRestoreError";
    }
  },
}));

describe("UCP checkout route", () => {
  test("returns to the same handoff URL after existing storefront sign-in on 401", async () => {
    handoff.restore.mockRejectedValueOnce(new UcpHandoffRestoreError("Authentication required", 401));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const next = vi.fn();
    const checkoutRoute = checkoutRoutes.find((route) => route.name === "Checkout")!;
    const beforeEnter = checkoutRoute.beforeEnter as NavigationGuard;
    const to = {
      query: { ucp_session: "opaque-session" },
      fullPath: "/checkout?ucp_session=opaque-session",
    } as unknown as RouteLocationNormalized;

    await beforeEnter(to, {} as RouteLocationNormalized, next);

    expect(next).toHaveBeenCalledWith({
      name: ROUTES.SIGN_IN.NAME,
      query: { returnUrl: "/checkout?ucp_session=opaque-session" },
      replace: true,
    });
  });
});
