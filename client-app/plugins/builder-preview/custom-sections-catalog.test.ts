import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { toCustomSectionSchemas, watchCustomSectionCatalog } from "./custom-sections-catalog";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { ICustomSectionType } from "@/core/theme-snapshot";
import type { ICustomSectionKitCatalog } from "@/shared/static-content/custom-sections/kit/catalog";

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

describe("watchCustomSectionCatalog", () => {
  it("adds the theme's custom types to the schemas, and applies again only when they change", async () => {
    const apply = vi.fn<(schemas: PageBuilderSchemaType, kit: ICustomSectionKitCatalog) => void>();
    const { setDraft } = useThemeSnapshot();
    setDraft(undefined);

    watchCustomSectionCatalog(BUILT_IN, apply);
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

  it("gives the kit's tags and behaviors as data, and applies again when the registry changes", async () => {
    const apply = vi.fn<(schemas: PageBuilderSchemaType, kit: ICustomSectionKitCatalog) => void>();
    watchCustomSectionCatalog(BUILT_IN, apply);

    const kit = apply.mock.lastCall?.[1];
    expect(Object.keys(kit?.tags ?? {})).toEqual(["vc-button", "vc-icon", "vc-badge", "vc-products"]);
    expect(kit?.tags["vc-products"].attributes.take).toEqual({
      type: "number",
      min: 1,
      max: 24,
      description: expect.any(String),
    });
    expect(kit?.behaviors.countdown).toEqual({
      description: expect.any(String),
      value: { type: "date" },
      options: { part: expect.objectContaining({ type: "select" }) },
      writes: ["data-ended", "text"],
    });
    expect(JSON.stringify(kit)).not.toContain("directive");
    expect(kit?.design).toMatchObject({
      containerName: "sb-section",
      containerMaxWidth: "1280px",
      breakpoints: expect.objectContaining({ md: "768px" }),
      tokens: expect.objectContaining({ "--vc-font-size-2xl": expect.objectContaining({ fallback: "1.5rem" }) }),
    });

    useExtensionRegistry().register("customSectionBehavior", "confetti", {
      directive: () => Promise.resolve({}),
      description: "Throws confetti.",
    });
    await nextTick();

    expect(apply.mock.lastCall?.[1].behaviors.confetti).toEqual({ description: "Throws confetti." });
    useExtensionRegistry().unregister("customSectionBehavior", "confetti");
  });
});
