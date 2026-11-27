import { describe, expect, it, vi, beforeEach } from "vitest";
import { corporateRoutes } from "./company";
import type { NavigationGuardWithThis, RouteLocationNormalized } from "vue-router";

const permissions = vi.hoisted(() => new Set<string>());

vi.mock("@/shared/account", () => ({
  useUser: () => ({ checkPermissions: (permission: string) => permissions.has(permission) }),
}));

function enterReporting() {
  const route = corporateRoutes.find((candidate) => candidate.name === "CompanyReporting");
  const guard = route?.beforeEnter as NavigationGuardWithThis<undefined> | undefined;
  const next = vi.fn();

  guard?.call(undefined, {} as RouteLocationNormalized, {} as RouteLocationNormalized, next);

  return next;
}

beforeEach(() => {
  permissions.clear();
});

describe("Company → Reporting route", () => {
  it("lets in a member allowed to see all of the organization's orders", () => {
    permissions.add("xapi:my_organization:order:view");

    expect(enterReporting()).toHaveBeenCalledWith();
  });

  it("sends anyone else to the no-access page", () => {
    expect(enterReporting()).toHaveBeenCalledWith({ name: "NoAccess" });
  });
});
