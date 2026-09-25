import { describe, it, expect, beforeEach, vi } from "vitest";

type FakeUserType = {
  contact?: { id: string; organization?: { id: string; name?: string } };
  operator?: { userName: string };
  permissions?: string[];
};

const hoisted = vi.hoisted(() => ({
  state: { isAuthenticated: false, user: undefined as FakeUserType | undefined },
}));

// Getter-backed stand-ins for the real composable's computeds, including the one that throws when the
// user has not loaded — that is the behaviour `buildUserProperties` has to guard against.
vi.mock("@/shared/account", () => ({
  useUser: () => ({
    isAuthenticated: {
      get value() {
        return hoisted.state.isAuthenticated;
      },
    },
    user: {
      get value() {
        if (!hoisted.state.user) {
          throw new Error("User is missing.");
        }
        return hoisted.state.user;
      },
    },
    organization: {
      get value() {
        return hoisted.state.user?.contact?.organization ?? null;
      },
    },
    operator: {
      get value() {
        return hoisted.state.user?.operator ?? null;
      },
    },
  }),
}));

const { buildUserProperties, USER_PROPERTY_NAMES, userPropertiesKey } = await import("./user-properties");

function signIn(user: FakeUserType): void {
  hoisted.state.isAuthenticated = true;
  hoisted.state.user = user;
}

const CONTACT: FakeUserType = {
  contact: { id: "contact-1", organization: { id: "org-1", name: "Acme Industrial" } },
  permissions: ["storefront:user:view"],
};

describe("buildUserProperties", () => {
  beforeEach(() => {
    hoisted.state.isAuthenticated = false;
    hoisted.state.user = undefined;
  });

  // gtag `set` merges, so "no identity" has to be stated as every property cleared. Returning a subset
  // would leave whoever signed out attached to the anonymous session that follows.
  it("clears every property for an anonymous visitor", () => {
    const properties = buildUserProperties();

    const names = Object.values(USER_PROPERTY_NAMES);

    expect(Object.keys(properties)).toHaveLength(names.length);
    expect(Object.keys(properties)).toEqual(expect.arrayContaining([...names]));
    expect(Object.values(properties).every((value) => value === undefined)).toBe(true);
  });

  it("does not throw before the user has loaded", () => {
    hoisted.state.isAuthenticated = false;
    hoisted.state.user = undefined;

    expect(() => buildUserProperties()).not.toThrow();
  });

  it("maps the signed-in identity", () => {
    signIn(CONTACT);

    expect(buildUserProperties()).toEqual({
      [USER_PROPERTY_NAMES.contactId]: "contact-1",
      [USER_PROPERTY_NAMES.organizationId]: "org-1",
      [USER_PROPERTY_NAMES.organizationName]: "Acme Industrial",
      [USER_PROPERTY_NAMES.isSalesRep]: "false",
      [USER_PROPERTY_NAMES.sessionKind]: "self",
    });
  });

  it("marks an impersonated session so a rep's browsing can be filtered out", () => {
    signIn({ ...CONTACT, operator: { userName: "rep@acme.test" } });

    expect(buildUserProperties()[USER_PROPERTY_NAMES.sessionKind]).toBe("impersonated");
  });

  // Present-but-empty, not absent: an omitted key would leave the previous customer's organization in GA.
  it("clears the organization for a customer with none", () => {
    signIn({ contact: { id: "contact-2" } });

    const properties = buildUserProperties();

    expect(properties).toHaveProperty(USER_PROPERTY_NAMES.organizationId);
    expect(properties[USER_PROPERTY_NAMES.organizationId]).toBeUndefined();
    expect(properties[USER_PROPERTY_NAMES.organizationName]).toBeUndefined();
    expect(properties[USER_PROPERTY_NAMES.contactId]).toBe("contact-2");
  });

  // A flag, not the role list: role names alone overflow the 36-character cap, and which of them survived
  // then depends on sort order rather than on anything meaningful.
  it("flags a sales rep by permission, whatever else the account carries", () => {
    signIn({ ...CONTACT, permissions: ["storefront:user:view", "sales-rep:access", "security:call_api"] });

    expect(buildUserProperties()[USER_PROPERTY_NAMES.isSalesRep]).toBe("true");
  });

  it("reports a plain customer as false rather than omitting the flag", () => {
    signIn(CONTACT);

    expect(buildUserProperties()[USER_PROPERTY_NAMES.isSalesRep]).toBe("false");
  });

  it("treats a missing permission list as not a rep", () => {
    signIn({ contact: { id: "contact-3" } });

    expect(buildUserProperties()[USER_PROPERTY_NAMES.isSalesRep]).toBe("false");
  });

  it("truncates a long organization name to GA4's value limit", () => {
    signIn({ contact: { id: "contact-4", organization: { id: "org-2", name: "N".repeat(50) } } });

    expect(buildUserProperties()[USER_PROPERTY_NAMES.organizationName]).toBe("N".repeat(36));
  });
});

describe("userPropertiesKey", () => {
  beforeEach(() => {
    hoisted.state.isAuthenticated = false;
    hoisted.state.user = undefined;
  });

  it("distinguishes anonymous from signed in", () => {
    const anonymous = userPropertiesKey();

    signIn(CONTACT);

    expect(userPropertiesKey()).not.toBe(anonymous);
  });

  it("is stable while the identity is unchanged", () => {
    signIn(CONTACT);

    expect(userPropertiesKey()).toBe(userPropertiesKey());
  });

  it("changes when the organization is switched", () => {
    signIn(CONTACT);
    const before = userPropertiesKey();

    signIn({ ...CONTACT, contact: { id: "contact-1", organization: { id: "org-9", name: "Other" } } });

    expect(userPropertiesKey()).not.toBe(before);
  });
});
