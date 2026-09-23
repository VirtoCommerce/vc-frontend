import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  and,
  authenticated,
  CONTRIBUTIONS_FILE_NAME,
  definePluginManifest,
  not,
  or,
  pluginContributions,
  settingEnabled,
  settingValue,
  themeSetting,
  userCan,
} from "../manifest.mjs";

describe("condition builders", () => {
  it("serialise to the plain AST", () => {
    expect(settingEnabled("SalesRep.Enabled")).toEqual({ setting: "SalesRep.Enabled" });
    expect(authenticated()).toEqual({ authenticated: true });
    expect(userCan("a")).toEqual({ can: "a" });
    expect(userCan("a", "b")).toEqual({ and: [{ can: "a" }, { can: "b" }] });
    expect(or(not(authenticated()), themeSetting("x"))).toEqual({
      or: [{ not: { authenticated: true } }, { themeSetting: "x" }],
    });
  });

  it("keep `eq` off the JSON until it is called", () => {
    const mode = settingValue("Mode");

    expect(JSON.parse(JSON.stringify(mode))).toEqual({ setting: "Mode" });
    expect(mode.eq("on")).toEqual({ setting: "Mode", eq: "on" });
    expect(JSON.parse(JSON.stringify(themeSetting("t").eq(3)))).toEqual({ themeSetting: "t", eq: 3 });
  });

  it("reject what cannot be serialised or evaluated", () => {
    expect(() => userCan()).toThrow(/at least one permission/);
    expect(() => and()).toThrow(/at least one condition/);
    expect(() => settingEnabled("")).toThrow(/non-empty string/);
    expect(() => settingValue("x").eq({})).toThrow(/string, number, boolean or null/);
  });
});

describe("definePluginManifest", () => {
  it("emits the whole sales-rep declaration", () => {
    const access = userCan("sales-rep:access");

    const contributions = definePluginManifest({
      when: settingEnabled("SalesRep.Enabled"),
      routes: [
        { path: "sales-reps", parent: "Company", name: "SalesReps" },
        { path: "documents", parent: "Company", name: "SalesRepDocuments", when: userCan("a", "b") },
      ],
      menu: [
        {
          surface: "header",
          group: "corporate",
          id: "sales-reps",
          title: "t",
          icon: "user-group",
          routeName: "SalesReps",
          priority: 40,
        },
        {
          surface: "account",
          id: "hub",
          title: "h",
          priority: 5,
          when: access,
          children: [{ id: "docs", title: "d", routeName: "SalesRepDocuments", when: userCan("a", "b") }],
        },
      ],
      slots: [
        { at: "accountMenu/my-customers", policy: "reserve" },
        { at: "mobileMenu/my-customers", policy: "none" },
        { at: "sharedList/provenance-note", policy: "reserve", when: (field) => field("scope").eq("Customer") },
      ],
    });

    expect(contributions).toEqual({
      format: 1,
      when: { setting: "SalesRep.Enabled" },
      routes: [
        { path: "sales-reps", name: "SalesReps", parent: "Company" },
        {
          path: "documents",
          name: "SalesRepDocuments",
          parent: "Company",
          when: { and: [{ can: "a" }, { can: "b" }] },
        },
      ],
      menu: [
        {
          surface: "header",
          group: "corporate",
          id: "sales-reps",
          title: "t",
          routeName: "SalesReps",
          icon: "user-group",
          priority: 40,
        },
        {
          surface: "account",
          id: "hub",
          title: "h",
          priority: 5,
          when: { can: "sales-rep:access" },
          children: [
            { id: "docs", title: "d", routeName: "SalesRepDocuments", when: { and: [{ can: "a" }, { can: "b" }] } },
          ],
        },
      ],
      slots: [
        { at: "accountMenu/my-customers", policy: "reserve" },
        { at: "mobileMenu/my-customers", policy: "none" },
        { at: "sharedList/provenance-note", policy: "reserve", when: { field: "scope", eq: "Customer" } },
      ],
    });
  });

  it("is JSON-stable: nothing in the result is a function or survives only by reference", () => {
    const contributions = definePluginManifest({
      when: settingValue("Mode"),
      slots: [{ at: "productCard/card-button", policy: "reserve", when: (field) => not(field("hasVariations")) }],
    });

    expect(JSON.parse(JSON.stringify(contributions))).toEqual(contributions);
  });

  it("emits only the format for an empty declaration", () => {
    expect(definePluginManifest({})).toEqual({ format: 1 });
  });

  it("refuses a field term anywhere but a slot", () => {
    expect(() => definePluginManifest({ when: { field: "x" } })).toThrow(/only valid on a slot/);
    expect(() =>
      definePluginManifest({ routes: [{ path: "p", name: "P", when: and(authenticated(), { field: "x" }) }] }),
    ).toThrow(/only valid on a slot/);
  });

  it("refuses a malformed declaration with the place it is in", () => {
    expect(() => definePluginManifest({ routes: [{ path: "a", name: "A" }, { path: "b", name: "A" }] })).toThrow(
      /routes: name "A" is declared twice/,
    );
    expect(() => definePluginManifest({ slots: [{ at: "productCard", policy: "reserve" }] })).toThrow(
      /slots\[0\]: `at` must read "<category>\/<name>"/,
    );
    expect(() => definePluginManifest({ slots: [{ at: "a/b", policy: "hold" }] })).toThrow(/slots\[0\]: `policy`/);
    expect(() => definePluginManifest({ menu: [{ surface: "footer" }] })).toThrow(/menu\[0\]: `surface`/);
    expect(() => definePluginManifest({ menu: [{ surface: "account", id: "a", title: "t" }] })).toThrow(
      /menu\[0\]: an account section needs `children`/,
    );
    expect(() => definePluginManifest({ when: { setting: "a", can: "b" } })).toThrow(/unknown condition/);
    expect(() => definePluginManifest({ when: { can: "b", eq: 1 } })).toThrow(/`eq` is not valid on a `can`/);
    expect(() => definePluginManifest({ when: { and: [] } })).toThrow(/non-empty list/);
  });
});

describe("pluginContributions", () => {
  let dir: string | undefined;

  afterEach(() => {
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
      dir = undefined;
    }
  });

  function withPluginJson(pluginJson: unknown) {
    dir = mkdtempSync(join(tmpdir(), "vc-contributions-"));
    writeFileSync(join(dir, "plugin.json"), JSON.stringify(pluginJson));
    const plugin = pluginContributions({ format: 1, when: { setting: "X" } });
    plugin.configResolved({ publicDir: dir });
    const context = { error: vi.fn((message: string) => { throw new Error(message); }), emitFile: vi.fn() };
    return { plugin, context };
  }

  it("emits contributions.json when plugin.json lists it", () => {
    const { plugin, context } = withPluginJson({ id: "p", contentFiles: [CONTRIBUTIONS_FILE_NAME] });

    plugin.buildStart.call(context);
    plugin.generateBundle.call(context);

    expect(context.emitFile).toHaveBeenCalledWith({
      type: "asset",
      fileName: "contributions.json",
      source: JSON.stringify({ format: 1, when: { setting: "X" } }, null, 2) + "\n",
    });
  });

  it("fails the build when plugin.json does not list it, since the host would never see it", () => {
    const { plugin, context } = withPluginJson({ id: "p", contentFiles: ["styles.css"] });

    expect(() => plugin.buildStart.call(context)).toThrow(/must list "contributions.json" in contentFiles/);
  });

  it("fails the build when there is no plugin.json at all", () => {
    const plugin = pluginContributions({ format: 1 });
    plugin.configResolved({ publicDir: join(tmpdir(), "vc-contributions-missing") });
    const context = { error: vi.fn((message: string) => { throw new Error(message); }) };

    expect(() => plugin.buildStart.call(context)).toThrow(/public\/plugin.json, which is missing/);
  });
});
