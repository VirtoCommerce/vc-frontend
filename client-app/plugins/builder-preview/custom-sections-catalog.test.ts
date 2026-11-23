import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import {
  registerCustomSectionBehavior,
  unregisterCustomSectionBehavior,
} from "@/shared/static-content/custom-sections/kit/registry";
import { toCustomSectionSchemas, watchCustomSectionCatalog } from "./custom-sections-catalog";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { ICustomSectionDefinition } from "@/core/theme-snapshot";
import type { ICustomSectionKitCatalog } from "@/shared/static-content/custom-sections/kit/catalog";
import type { EffectScope, Ref } from "vue";

const languages = vi.hoisted(() => ({ currentLanguage: undefined as unknown as Ref<{ cultureName: string }> }));

vi.mock("@/core/composables/useLanguages", async () => {
  const { ref } = await import("vue");
  languages.currentLanguage = ref({ cultureName: "de-DE" });
  return { useLanguages: () => ({ currentLanguage: languages.currentLanguage, defaultStoreCulture: ref("en-US") }) };
});

const STATS: ICustomSectionDefinition = {
  format: 1,
  name: { "en-US": "Stats", "de-DE": "Statistik" },
  schema: {
    settings: [{ id: "title", type: "string", translatable: true }],
    targetTemplates: ["page"],
    limit: 2,
    icon: "chart",
  },
  template: "<section>{{ settings.title }}</section>",
  css: "",
};

function byName(a: string, b: string): number {
  return a < b ? -1 : 1;
}

const BUILT_IN: PageBuilderSchemaType = {
  blocks: {},
  sections: { "text-block": { type: "text-block", name: "Text" } },
  shared: {},
  objects: {},
  templates: {},
  settingsSchema: {},
};

describe("toCustomSectionSchemas", () => {
  it("gives each custom type its name as the type stores it, settings, templates, limit and icon, marked custom, without the shared background", () => {
    expect(toCustomSectionSchemas({ "custom-stats": STATS })).toEqual({
      "custom-stats": {
        type: "custom-stats",
        name: { "en-US": "Stats", "de-DE": "Statistik" },
        settings: STATS.schema.settings,
        targetTemplates: ["page"],
        limit: 2,
        icon: "chart",
        custom: true,
        excludeShared: ["background"],
      },
    });
  });

  it("leaves out a type with a name the storefront refuses or without settings", () => {
    const broken = { ...STATS, schema: {} } as unknown as ICustomSectionDefinition;

    expect(toCustomSectionSchemas({ stats: STATS, "custom-broken": broken })).toEqual({});
  });

  it.each<[string, unknown]>([
    ["no name", undefined],
    ["an empty name", ""],
    ["a name that is not text", { "en-US": 1 }],
    ["a blank name", " "],
    ["a name keyed by no language", { label: "Stats" }],
    ["a name blank in a language", { "en-US": "Stats", "de-DE": "" }],
  ])("names a type by its type when it has %s", (_, name) => {
    const definition = { ...STATS, name } as ICustomSectionDefinition;

    expect(toCustomSectionSchemas({ "custom-stats": definition })["custom-stats"].name).toBe("custom-stats");
  });
});

describe("watchCustomSectionCatalog", () => {
  let scope: EffectScope;

  function watchCatalog(apply: (schemas: PageBuilderSchemaType, kit: ICustomSectionKitCatalog) => void): void {
    scope.run(() => watchCustomSectionCatalog(BUILT_IN, apply));
  }

  beforeEach(() => {
    scope = effectScope();
  });

  afterEach(() => {
    scope.stop();
    unregisterCustomSectionBehavior("confetti");
    languages.currentLanguage.value = { cultureName: "de-DE" };
    useThemeSnapshot().setDraft(undefined);
  });

  it("adds the theme's custom types to the schemas, and applies again only when they change", async () => {
    const apply = vi.fn<(schemas: PageBuilderSchemaType, kit: ICustomSectionKitCatalog) => void>();
    const { setDraft } = useThemeSnapshot();
    setDraft(undefined);

    watchCatalog(apply);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(Object.keys(apply.mock.lastCall?.[0].sections ?? {})).toEqual(["text-block"]);

    setDraft({ customSections: { "custom-stats": STATS } });
    await nextTick();
    expect(apply).toHaveBeenCalledTimes(2);
    expect(Object.keys(apply.mock.lastCall?.[0].sections ?? {})).toEqual(["custom-stats", "text-block"]);
    expect(apply.mock.lastCall?.[0].sections["custom-stats"].name).toEqual(STATS.name);

    setDraft({ customSections: { "custom-stats": STATS }, brand: { logoUrl: "/logo.svg" } });
    await nextTick();
    expect(apply).toHaveBeenCalledTimes(2);

    setDraft({ customSections: { "custom-stats": { ...STATS, schema: { ...STATS.schema, limit: 1 } } } });
    await nextTick();
    expect(apply).toHaveBeenCalledTimes(3);
  });

  it("gives the kit's tags and behaviors as data, and applies again when the registry changes", async () => {
    const apply = vi.fn<(schemas: PageBuilderSchemaType, kit: ICustomSectionKitCatalog) => void>();
    watchCatalog(apply);

    const kit = apply.mock.lastCall?.[1];
    const iconCost = 1 + __SB_ICON_ELEMENTS__;
    expect(Object.fromEntries(Object.entries(kit?.tags ?? {}).map(([name, tag]) => [name, tag.cost]))).toEqual({
      "vc-button": 5 + 2 * iconCost,
      "vc-icon": iconCost,
      "vc-badge": 2,
      "vc-products": 2401,
      "vc-image": 1,
      "vc-link": 1,
      "vc-chip": 2 + iconCost,
      "vc-alert": 4 + iconCost,
      "vc-typography": 1,
      "vc-rating": 6 + 5 * (3 + 2 * iconCost),
      "vc-shape": 1 + iconCost,
      "vc-property": 4,
    });
    expect([kit?.tags["vc-button"].hasSideEffects, kit?.tags["vc-products"].hasSideEffects]).toEqual([false, true]);
    expect(kit?.tags["vc-products"].attributes.take).toEqual({
      type: "number",
      min: 1,
      max: 24,
      description: expect.any(String),
    });
    expect(kit?.behaviors.marquee.repeatsChildren).toBe(true);
    expect(kit?.behaviors.countdown).toEqual({
      description: expect.any(String),
      value: { type: "date" },
      options: { part: expect.objectContaining({ type: "select" }) },
      writes: ["data-ended", "text"],
      textAttributes: ["data-countdown-part"],
    });
    expect(kit?.behaviors["count-up"].textAttributes).toEqual(["data-count-up"]);
    expect(Object.keys(kit?.tags["vc-button"] ?? {})).toEqual(["description", "attributes", "cost", "hasSideEffects"]);
    expect(Object.keys(kit?.behaviors.marquee ?? {})).toEqual(["description", "writes", "repeatsChildren"]);
    expect(kit?.icons).toEqual(expect.arrayContaining(["star", "shopping-cart"]));
    expect(kit?.icons).toEqual([...new Set(kit?.icons)].sort((a, b) => a.localeCompare(b)));
    expect(JSON.stringify(kit).match(/"shopping-cart"/g)).toHaveLength(1);
    for (const field of [
      kit?.tags["vc-icon"].attributes.name,
      kit?.tags["vc-button"].attributes["prepend-icon"],
      kit?.tags["vc-button"].attributes["append-icon"],
    ]) {
      expect(field).toEqual({ type: "select", optionsFrom: "icons", description: expect.any(String) });
    }
    expect(kit?.guide).toMatch(/^# Writing a custom section/);
    expect(kit?.design).toMatchObject({
      containerName: "sb-section",
      containerMaxWidth: "1280px",
      breakpoints: expect.objectContaining({ md: "768px" }),
      tokens: expect.objectContaining({ "--vc-font-size-2xl": expect.objectContaining({ fallback: "1.5rem" }) }),
    });

    registerCustomSectionBehavior("confetti", {
      directive: () => Promise.resolve({}),
      description: "Throws confetti.",
    });
    await nextTick();

    expect(apply.mock.lastCall?.[1].behaviors.confetti).toEqual({ description: "Throws confetti." });
  });

  it("lists the kit's tags and behaviors by name, whatever order they registered in", () => {
    const apply = vi.fn<(schemas: PageBuilderSchemaType, kit: ICustomSectionKitCatalog) => void>();
    registerCustomSectionBehavior("confetti", {
      directive: () => Promise.resolve({}),
      description: "Throws confetti.",
    });
    watchCatalog(apply);

    const kit = apply.mock.lastCall?.[1];
    const tags = Object.keys(kit?.tags ?? {});
    const behaviors = Object.keys(kit?.behaviors ?? {});

    expect(behaviors).toContain("confetti");
    expect(tags).toEqual([...tags].sort(byName));
    expect(behaviors).toEqual([...behaviors].sort(byName));
  });

  it("applies the same catalog whatever language the preview shows", async () => {
    const apply = vi.fn<(schemas: PageBuilderSchemaType, kit: ICustomSectionKitCatalog) => void>();
    useThemeSnapshot().setDraft({ customSections: { "custom-stats": STATS } });
    watchCatalog(apply);
    const calls = apply.mock.calls.length;

    languages.currentLanguage.value = { cultureName: "en-US" };
    await nextTick();

    expect(apply.mock.calls).toHaveLength(calls);
  });
});
