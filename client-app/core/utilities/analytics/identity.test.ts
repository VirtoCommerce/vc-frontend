import { describe, it, expect } from "vitest";
import { getCustomerIdentity } from "./identity";
import type { CustomerIdentitySourceType } from "./identity";

type FakeUserType = { id: string; contact?: { id: string }; permissions?: string[] };

function source(
  user: FakeUserType | undefined,
  organization?: { id: string },
  operator?: unknown,
): CustomerIdentitySourceType {
  return {
    isAuthenticated: { value: Boolean(user) },
    user: {
      get value() {
        if (!user) {
          throw new Error("User is missing.");
        }
        return user;
      },
    },
    organization: { value: organization ?? null },
    operator: { value: operator ?? null },
  };
}

describe("getCustomerIdentity", () => {
  it("is empty for a signed-out visitor and reads nothing that throws", () => {
    expect(getCustomerIdentity(source(undefined))).toBeUndefined();
  });

  it("maps the signed-in user", () => {
    expect(getCustomerIdentity(source({ id: "user-1", contact: { id: "contact-1" } }, { id: "org-1" }))).toEqual({
      userId: "user-1",
      contactId: "contact-1",
      organizationId: "org-1",
      isSalesRep: false,
      sessionKind: "self",
    });
  });

  it("marks an impersonated session so a rep's browsing can be filtered out", () => {
    expect(getCustomerIdentity(source({ id: "user-1" }, undefined, { userName: "rep" }))?.sessionKind).toBe(
      "impersonated",
    );
  });

  // Raw membership: `checkPermissions` would grant an administrator everything.
  it("flags a sales rep by the permission string", () => {
    expect(getCustomerIdentity(source({ id: "user-1", permissions: ["sales-rep:access"] }))?.isSalesRep).toBe(true);
    expect(getCustomerIdentity(source({ id: "user-1" }))?.isSalesRep).toBe(false);
  });

  it("leaves contact and organization undefined, not empty, when absent", () => {
    const identity = getCustomerIdentity(source({ id: "user-1" }));

    expect(identity?.contactId).toBeUndefined();
    expect(identity?.organizationId).toBeUndefined();
  });
});
