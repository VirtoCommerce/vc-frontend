import { describe, it, expect, beforeEach, vi } from "vitest";

type FakeUserType = {
  id: string;
  contact?: { id: string; organization?: { id: string; name?: string } };
  operator?: { userName: string };
  permissions?: string[];
};

const hoisted = vi.hoisted(() => ({
  state: { isAuthenticated: false, user: undefined as FakeUserType | undefined },
  client: {
    identify: vi.fn(),
    group: vi.fn(),
    reset: vi.fn(),
  },
  hasClient: true,
}));

// Getter-backed stand-ins for the real composable's computeds, including the one that throws when the
// user has not loaded — that is the behaviour the identity read has to guard against.
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

vi.mock("./client", () => ({
  getClient: () => (hoisted.hasClient ? hoisted.client : undefined),
}));

const { applyIdentity, identityKey, PERSON_PROPERTY_NAMES } = await import("./identity");
const { IDENTIFIED_STORAGE_KEY } = await import("./constants");

const CONTACT: FakeUserType = {
  id: "user-1",
  contact: { id: "contact-1", organization: { id: "org-1", name: "Acme Industrial" } },
  permissions: ["storefront:user:view"],
};

function signIn(user: FakeUserType): void {
  hoisted.state.isAuthenticated = true;
  hoisted.state.user = user;
}

describe("identityKey", () => {
  beforeEach(() => {
    hoisted.state.isAuthenticated = false;
    hoisted.state.user = undefined;
  });

  it("does not throw before the user has loaded", () => {
    expect(() => identityKey()).not.toThrow();
  });

  it("is stable while the identity is unchanged and changes with it", () => {
    const anonymous = identityKey();
    signIn(CONTACT);

    expect(identityKey()).toBe(identityKey());
    expect(identityKey()).not.toBe(anonymous);
  });
});

describe("applyIdentity", () => {
  beforeEach(() => {
    hoisted.state.isAuthenticated = false;
    hoisted.state.user = undefined;
    hoisted.hasClient = true;
    hoisted.client.identify.mockReset();
    hoisted.client.group.mockReset();
    hoisted.client.reset.mockReset();
    localStorage.clear();
  });

  // The backend module sends its events under the platform user id: both sides must agree on it.
  it("identifies by the platform user id with the person properties and the organization group", () => {
    signIn({ ...CONTACT, operator: { userName: "rep@acme.test" }, permissions: ["sales-rep:access"] });

    applyIdentity();

    expect(hoisted.client.identify).toHaveBeenCalledWith("user-1", {
      [PERSON_PROPERTY_NAMES.contactId]: "contact-1",
      [PERSON_PROPERTY_NAMES.organizationId]: "org-1",
      [PERSON_PROPERTY_NAMES.isSalesRep]: true,
      [PERSON_PROPERTY_NAMES.sessionKind]: "impersonated",
    });
    expect(hoisted.client.group).toHaveBeenCalledWith("organization", "org-1");
    expect(hoisted.client.reset).not.toHaveBeenCalled();
    expect(localStorage.getItem(IDENTIFIED_STORAGE_KEY)).toBe("1");
  });

  it("attaches no group for a customer without an organization", () => {
    signIn({ id: "user-2", contact: { id: "contact-2" } });

    applyIdentity();

    expect(hoisted.client.identify).toHaveBeenCalledWith("user-2", expect.objectContaining({ session_kind: "self" }));
    expect(hoisted.client.group).not.toHaveBeenCalled();
  });

  // Free text, and it can be a person's name (a sole trader's company).
  it("does not send the organization name", () => {
    signIn(CONTACT);

    applyIdentity();

    expect(JSON.stringify(hoisted.client.identify.mock.calls)).not.toContain("Acme Industrial");
  });

  // The sign-out reloaded the page; the SDK still holds the previous person in its persistence.
  it("resets a signed-out page that was identified before", () => {
    localStorage.setItem(IDENTIFIED_STORAGE_KEY, "1");

    applyIdentity();

    expect(hoisted.client.reset).toHaveBeenCalledTimes(1);
    expect(hoisted.client.identify).not.toHaveBeenCalled();
    expect(localStorage.getItem(IDENTIFIED_STORAGE_KEY)).toBeNull();
  });

  // Resetting here would give an anonymous visitor a new person on every page load.
  it("leaves an anonymous visitor who was never identified alone", () => {
    applyIdentity();

    expect(hoisted.client.reset).not.toHaveBeenCalled();
  });

  it("does nothing without a client", () => {
    hoisted.hasClient = false;
    signIn(CONTACT);

    expect(() => applyIdentity()).not.toThrow();
    expect(hoisted.client.identify).not.toHaveBeenCalled();
  });
});
