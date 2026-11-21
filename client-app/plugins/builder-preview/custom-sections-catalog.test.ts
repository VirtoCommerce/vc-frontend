import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { toCustomSectionSchemas, watchCustomSectionSchemas } from "./custom-sections-catalog";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { ICustomSectionType } from "@/core/theme-snapshot";

vi.mock("@/core/composables/useLanguages", async () => {
  const { ref } = await import("vue");
  return {
    useLanguages: () => ({ currentLanguage: ref({ cultureName: "de-DE" }), defaultStoreCulture: ref("en-US") }),
  };
});

const STATS: ICustomSectionType = {
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

const BUILT_IN: PageBuilderSchemaType = {
  blocks: {},
  sections: { "text-block": { type: "text-block", name: "Text" } },
  shared: {},
  objects: {},
  templates: {},
  settingsSchema: {},
};

describe("toCustomSectionSchemas", () => {
  it("gives each custom type its name, settings, templates, limit and icon, marked custom", () => {
    expect(toCustomSectionSchemas({ "custom-stats": STATS }, () => "Stats")).toEqual({
      "custom-stats": {
        type: "custom-stats",
        name: "Stats",
        settings: STATS.schema.settings,
        targetTemplates: ["page"],
        limit: 2,
        icon: "chart",
        custom: true,
      },
    });
  });

  it("leaves out a type with a name the storefront refuses or without settings", () => {
    const broken = { ...STATS, schema: {} } as unknown as ICustomSectionType;

    expect(toCustomSectionSchemas({ stats: STATS, "custom-broken": broken }, () => "Stats")).toEqual({});
  });

  it("names a type by its type when its name does not resolve", () => {
    expect(toCustomSectionSchemas({ "custom-stats": STATS }, () => undefined)["custom-stats"].name).toBe(
      "custom-stats",
    );
  });
});

describe("watchCustomSectionSchemas", () => {
  it("adds the theme's custom types to the schemas, and applies again only when they change", async () => {
    const apply = vi.fn<(schemas: PageBuilderSchemaType) => void>();
    const { setDraft } = useThemeSnapshot();
    setDraft(undefined);

    watchCustomSectionSchemas(BUILT_IN, apply);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(Object.keys(apply.mock.lastCall?.[0].sections ?? {})).toEqual(["text-block"]);

    setDraft({ customSections: { "custom-stats": STATS } });
    await nextTick();
    expect(apply).toHaveBeenCalledTimes(2);
    expect(Object.keys(apply.mock.lastCall?.[0].sections ?? {})).toEqual(["custom-stats", "text-block"]);
    expect(apply.mock.lastCall?.[0].sections["custom-stats"].name).toBe("Statistik");

    setDraft({ customSections: { "custom-stats": STATS }, brand: { logoUrl: "/logo.svg" } });
    await nextTick();
    expect(apply).toHaveBeenCalledTimes(2);

    setDraft({ customSections: { "custom-stats": { ...STATS, schema: { ...STATS.schema, limit: 1 } } } });
    await nextTick();
    expect(apply).toHaveBeenCalledTimes(3);
  });
});
