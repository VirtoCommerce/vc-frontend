import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildThemeSnapshotScript } from "./inline-script";
import { THEME_SNAPSHOT_GLOBAL } from "./query";

type SentRequestType = {
  variables: { domain: string; cultureName?: string; permalink?: string };
  response: Promise<unknown>;
};

function runScript(path: string, options?: { domain?: string }): SentRequestType {
  window.history.replaceState(null, "", path);
  // The script is written for index.html, where it runs as plain JavaScript in the page.
  // eslint-disable-next-line sonarjs/code-eval -- runs the generated script under test
  new Function(buildThemeSnapshotScript(options))(); // nosemgrep: semgrep.vc-dynamic-code-execution -- the script under test
  return (window as unknown as Record<string, SentRequestType>)[THEME_SNAPSHOT_GLOBAL];
}

describe("buildThemeSnapshotScript", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: { themeSnapshot: null } }) });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    localStorage.clear();
    delete (window as unknown as Record<string, unknown>)[THEME_SNAPSHOT_GLOBAL];
  });

  it("sends the language prefix of the URL, the page's host and its permalink", async () => {
    const request = runScript("/de/catalog/shoes");

    expect(request.variables).toEqual({
      domain: window.location.hostname,
      cultureName: "de",
      permalink: "catalog/shoes",
    });
    expect(fetchMock).toHaveBeenCalledWith("/graphql", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body) as Record<string, unknown>;
    expect(body.operationName).toBe("ThemeSnapshot");
    expect(body.variables).toEqual({ domain: window.location.hostname, cultureName: "de", permalink: "catalog/shoes" });
    await expect(request.response).resolves.toEqual({ data: { themeSnapshot: null } });
  });

  it("falls back to the pinned locale, then to no language", () => {
    localStorage.setItem("pinnedLocale", "fr-FR");
    expect(runScript("/catalog").variables.cultureName).toBe("fr-FR");

    localStorage.clear();
    expect(runScript("/catalog").variables.cultureName).toBeUndefined();
  });

  it("takes the previewed page's language on the designer preview route", () => {
    expect(runScript("/designer-preview?cultureName=es-ES").variables.cultureName).toBe("es-ES");
    expect(runScript("/designer-preview?cultureName=%3Cscript%3E").variables.cultureName).toBeUndefined();
  });

  it.each([
    ["/", "/"],
    ["/de", "/"],
    ["/de-DE/", "/"],
    ["/printers/", "printers"],
    ["/printers//laser?sort=price#top", "printers/laser"],
    ["/destinations", "destinations"],
    ["/fr/caf%C3%A9", "café"],
    ["/bad%E0%A4%A", "bad%E0%A4%A"],
  ])("sends the permalink of %s as the slug route looks it up: %s", (path, permalink) => {
    expect(runScript(path).variables.permalink).toBe(permalink);
  });

  it("sends no permalink on the designer preview route", () => {
    expect(runScript("/designer-preview?cultureName=es-ES").variables.permalink).toBeUndefined();
  });

  it("uses the domain it was built with", () => {
    expect(runScript("/", { domain: "store.example.com" }).variables.domain).toBe("store.example.com");
  });

  it("rejects the request on an HTTP error without an unhandled rejection", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 502 });

    await expect(runScript("/").response).rejects.toThrow("HTTP 502");
  });
});
