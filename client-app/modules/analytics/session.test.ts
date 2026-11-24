import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_STORAGE_KEY } from "./constants";

// Loaded anew for every test: the module remembers a session it could not store.
let getSession: typeof import("./session").getSession;
let startSessionFor: typeof import("./session").startSessionFor;

beforeEach(async () => {
  vi.resetModules();
  ({ getSession, startSessionFor } = await import("./session"));
});

function setReferrer(value: string): void {
  Object.defineProperty(document, "referrer", { value, configurable: true });
}

describe("getSession", () => {
  beforeEach(() => {
    sessionStorage.clear();
    setReferrer("");
    history.replaceState(null, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts a session with the landing page, the campaign and the site the visitor came from", () => {
    history.replaceState(null, "", "/catalog?utm_source=newsletter&utm_campaign=spring&q=bolt");
    setReferrer("https://partner.example/deals?token=secret");

    const session = getSession();

    expect(session.id).toBeTruthy();
    expect(session).toMatchObject({
      landing_path: "/catalog",
      referrer: "https://partner.example/deals",
      utm_source: "newsletter",
      utm_campaign: "spring",
    });
    expect(session).not.toHaveProperty("utm_medium");
  });

  it("keeps the session and how it started on the next pages", () => {
    history.replaceState(null, "", "/catalog?utm_source=newsletter");
    const first = getSession();

    history.replaceState(null, "", "/cart?utm_source=other");

    expect(getSession()).toEqual(first);
  });

  it("does not call a page of the storefront itself a referrer", () => {
    setReferrer(`${location.origin}/sign-in`);

    expect(getSession().referrer).toBeUndefined();
  });

  it("starts over when what is stored is not a session", () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "{not json");
    const first = getSession();

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ landing_path: "/" }));
    const second = getSession();

    expect(first.id).toBeTruthy();
    expect(second.id).toBeTruthy();
    expect(second.id).not.toBe(first.id);
  });

  it("still returns a session when storage is not available", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });

    expect(getSession().id).toBeTruthy();
  });

  it("keeps one session for the page when storage is not available", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    history.replaceState(null, "", "/catalog?utm_source=newsletter");

    const first = getSession();
    history.replaceState(null, "", "/cart");

    expect(getSession()).toEqual(first);
    expect(first).toMatchObject({ landing_path: "/catalog", utm_source: "newsletter" });
  });

  it("takes the landing path from the caller", () => {
    expect(getSession(() => "/shared-list/:sharingKey").landing_path).toBe("/shared-list/:sharingKey");
  });
});

describe("startSessionFor", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is true once per identity and again when the identity changes", () => {
    expect(startSessionFor("")).toBe(true);
    expect(startSessionFor("")).toBe(false);
    expect(startSessionFor("user-1|org-1")).toBe(true);
    expect(startSessionFor("user-1|org-1")).toBe(false);
    expect(startSessionFor("user-1|org-2")).toBe(true);
  });

  it("is true when storage cannot remember the identity", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });

    expect(startSessionFor("user-1|org-1")).toBe(true);
  });
});
