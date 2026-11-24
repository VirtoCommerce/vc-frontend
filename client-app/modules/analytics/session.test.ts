import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_STORAGE_KEY } from "./constants";
import { getSession } from "./session";

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

    const { session, isNew } = getSession();

    expect(isNew).toBe(true);
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
    const first = getSession().session;

    history.replaceState(null, "", "/cart?utm_source=other");
    const { session, isNew } = getSession();

    expect(isNew).toBe(false);
    expect(session).toEqual(first);
  });

  it("does not call a page of the storefront itself a referrer", () => {
    setReferrer(`${location.origin}/sign-in`);

    expect(getSession().session.referrer).toBeUndefined();
  });

  it("starts over when what is stored is not a session", () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "{not json");

    expect(getSession().isNew).toBe(true);

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ landing_path: "/" }));

    expect(getSession().isNew).toBe(true);
  });

  it("still returns a session when storage is not available", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });

    const { session, isNew } = getSession();

    expect(isNew).toBe(true);
    expect(session.id).toBeTruthy();
  });
});
