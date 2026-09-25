import { describe, expect, test, vi } from "vitest";
import { saveUcpContinuation } from "@/shared/checkout/ucp/continuation";
import { UcpHandoffRestoreError } from "@/shared/checkout/ucp/handoff";
import { checkoutRoutes } from "./checkout";
import { ROUTES } from "./constants";
import type { NavigationGuard, RouteLocationNormalized } from "vue-router";

const handoff = vi.hoisted(() => ({
  restore: vi.fn(),
}));

vi.mock("@/shared/checkout/ucp/handoff", () => ({
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
    const reference = saveUcpContinuation("opaque-session");
    const next = vi.fn();
    const checkoutRoute = checkoutRoutes.find((route) => route.name === "Checkout")!;
    const beforeEnter = checkoutRoute.beforeEnter as NavigationGuard;
    const to = {
      query: { ucp_resume: reference },
      fullPath: `/checkout?ucp_resume=${reference}`,
    } as unknown as RouteLocationNormalized;

    await beforeEnter(to, {} as RouteLocationNormalized, next);

    expect(next).toHaveBeenCalledWith({
      name: ROUTES.SIGN_IN.NAME,
      query: { returnUrl: to.fullPath, reauthenticate: "1" },
      replace: true,
    });
  });
});
