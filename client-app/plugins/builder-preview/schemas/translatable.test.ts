import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { resolveTranslatableValues, useThemeGroups, useThemeSnapshot } from "@/core/theme-snapshot";
import { useThemeTemplates } from "@/shared/static-content";
import { findEditableTexts } from "../inline-text-editor";
import { findSchemaField } from "../preview-v2";
import { getRegisteredComponents } from "../register-components";
import type { PageBuilderSchemaType } from "../models/PageBuilderSchemaType";
import type { IThemeItem } from "@/core/theme-snapshot";

vi.mock("@/core/theme-snapshot/enabled", () => ({ isNewPageBuilderEnabled: () => true }));
vi.mock("../utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../utils")>()),
  isOpenedWithPreviewProtocol: () => true,
}));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ currentLanguage: ref({ cultureName: "de-DE" }), defaultStoreCulture: ref("en-US") }),
}));
vi.mock("@/core/composables/useDarkMode", () => ({ useDarkMode: () => ({ setColorModeOverride: vi.fn() }) }));
vi.mock("@/core/composables/useWhiteLabeling", async () => {
  const { computed } = await import("vue");
  return { useWhiteLabeling: () => ({ themeFieldsSetByWhiteLabeling: computed(() => []) }) };
});

interface IField {
  id?: string;
  type?: string;
  translatable?: boolean;
  element?: IField[];
}

interface ISchema {
  settings?: IField[];
  includeShared?: string[];
}

const TEXT_TYPES = ["string", "text", "markdown"];

function translatablePaths(fields: IField[] = [], prefix = ""): string[] {
  return fields.flatMap((field) => [
    ...(field.translatable ? [`${prefix}${field.id}`] : []),
    ...translatablePaths(field.element, `${prefix}${field.id}[].`),
  ]);
}

function allFields(fields: IField[] = []): IField[] {
  return fields.flatMap((field) => [field, ...allFields(field.element)]);
}

function settingsOf(schemas: PageBuilderSchemaType, schema: ISchema): IField[] {
  const shared = (schema.includeShared ?? []).flatMap((name) => (schemas.shared[name] as ISchema).settings ?? []);
  return [...(schema.settings ?? []), ...shared];
}

function withTexts(fields: IField[], path: string): Record<string, unknown> {
  const values: [string, unknown][] = fields.flatMap((field): [string, unknown][] => {
    const fieldPath = `${path}.${field.id}`;

    if (field.translatable) {
      return [[field.id!, { "en-US": `${fieldPath} en`, "de-DE": `${fieldPath} de` }]];
    }

    if (field.element && translatablePaths(field.element).length) {
      const row = withTexts(field.element, `${fieldPath}[]`);
      return [[field.id!, field.type === "list" ? [row] : row]];
    }

    return [];
  });

  return Object.fromEntries(values);
}

function shownTexts(fields: IField[], value: unknown, path: string): [string, unknown][] {
  return fields.flatMap((field): [string, unknown][] => {
    const fieldValue = (value as Record<string, unknown>)[field.id!];
    const fieldPath = `${path}.${field.id}`;

    if (field.translatable) {
      return [[fieldPath, fieldValue]];
    }

    if (field.element && translatablePaths(field.element).length) {
      const row = field.type === "list" ? (fieldValue as unknown[])[0] : fieldValue;
      return shownTexts(field.element, row, `${fieldPath}[]`);
    }

    return [];
  });
}

const translated = (texts: [string, unknown][]) => texts.map(([path]) => [path, `${path} de`]);

let schemas: PageBuilderSchemaType;

describe("translatable texts of the theme's sections and blocks", () => {
  beforeEach(async () => {
    schemas ??= await getRegisteredComponents();
    useThemeSnapshot().setPublished(null);
    useThemeSnapshot().setDraft(undefined);
    useThemeTemplates().setOpenTemplate(undefined);
  });

  it("marks the texts a visitor reads, and only text settings", () => {
    const marked = (["sections", "blocks", "shared", "objects"] as const).flatMap((kind) =>
      Object.entries(schemas[kind]).flatMap(([name, schema]) =>
        translatablePaths((schema as ISchema).settings).map((path) => `${kind}/${name}.${path}`),
      ),
    );
    const markedTypes = (["sections", "blocks", "shared", "objects"] as const).flatMap((kind) =>
      Object.values(schemas[kind]).flatMap((schema) =>
        allFields((schema as ISchema).settings).filter((field) => field.translatable),
      ),
    );

    expect(markedTypes.every((field) => TEXT_TYPES.includes(field.type ?? ""))).toBe(true);
    expect(new Set(marked)).toEqual(
      new Set([
        "sections/call-to-action-with-image.title",
        "sections/call-to-action-with-image.subtitle",
        "sections/call-to-action-with-image.imageDescription",
        "sections/call-to-action.title",
        "sections/category.title",
        "sections/favorite-products.title[].text",
        "sections/favorite-products.subtitle[].text",
        "sections/features.title",
        "sections/features.subtitle",
        "sections/features.columns[].title",
        "sections/features.columns[].text",
        "sections/image-carousel.title",
        "sections/image-carousel.subtitle",
        "sections/image.alttext",
        "sections/predefined-product-list.title",
        "sections/predefined-product-list.subtitle",
        "sections/products-carousel.title",
        "sections/products-carousel.subtitle",
        "sections/products.title",
        "sections/products.subtitle",
        "sections/slider.title",
        "sections/slider.subtitle",
        "sections/slider.slides[].title",
        "sections/slider.slides[].text",
        "sections/subscribe-form.title",
        "sections/subscribe-form.subtitle",
        "sections/subscribe-form.placeholder",
        "sections/subscribe-form.checkboxText",
        "sections/subscribe-form.buttonText",
        "sections/text.text",
        "sections/title.subtitle",
        "sections/site-footer.copyright",
        "blocks/product-assets.title",
        "blocks/product-description.title",
        "blocks/product-properties.title",
        "blocks/product-variations.title",
        "blocks/product-options.title",
        "blocks/text.header",
        "blocks/text.text",
        "blocks/announcement.text",
        "blocks/footer-menu.heading",
        "blocks/footer-menu.links[].label",
        "shared/buttons.buttons[].label",
        "shared/title.title",
        "objects/button.caption",
      ]),
    );
  });

  it("finds a translatable setting by an edited text's path, in lists and in the shared settings", () => {
    expect(findSchemaField(schemas, "slider", ["slides", 0, "title"])?.translatable).toBe(true);
    expect(findSchemaField(schemas, "call-to-action", ["buttons", 1, "label"])?.translatable).toBe(true);
    expect(findSchemaField(schemas, "text", ["title"])?.translatable).toBe(true);
    expect(findSchemaField(schemas, "slider", ["slides", 0, "url"])?.translatable).toBeUndefined();
  });

  it("offers a list's translatable text for inline editing in the current language", () => {
    const slider = {
      id: "s1",
      type: "slider",
      slides: [{ title: { "en-US": "Sale", "de-DE": "Angebote" }, url: "/sale" }],
    };
    const shown = resolveTranslatableValues(slider, "de-DE", "en-US");

    expect(
      findEditableTexts(
        shown,
        (type, path) => findSchemaField(schemas, type, path)?.type === "string",
        () => false,
      ),
    ).toContainEqual({ itemId: "s1", path: ["slides", 0, "title"], value: "Angebote", multiline: false });
  });

  it("shows every translatable text of a draft template in the current language, in lists, objects and blocks", () => {
    const sections = Object.entries(schemas.sections)
      .map(([type, schema]) => ({ type, fields: settingsOf(schemas, schema as ISchema) }))
      .filter(({ fields }) => translatablePaths(fields).length);
    const blocks = Object.entries(schemas.blocks)
      .map(([type, schema]) => ({ type, fields: settingsOf(schemas, schema as ISchema) }))
      .filter(({ fields }) => translatablePaths(fields).length);
    const content: IThemeItem[] = [
      ...sections.map(({ type, fields }) => ({ id: type, type, ...withTexts(fields, type) })),
      {
        id: "info",
        type: "product-info",
        blocks: blocks.map(({ type, fields }) => ({ id: type, type, ...withTexts(fields, type) })),
      },
    ];
    useThemeSnapshot().setDraft({ templates: {} });
    useThemeTemplates().setOpenTemplate("product", { settings: {}, content });

    const shown = useThemeTemplates().resolveTemplate("product", { categoryPaths: [], properties: [] }).document
      .content;
    const texts = [
      ...sections.flatMap(({ type, fields }) =>
        shownTexts(
          fields,
          shown.find((item) => item.id === type),
          type,
        ),
      ),
      ...blocks.flatMap(({ type, fields }) =>
        shownTexts(
          fields,
          shown.find((item) => item.id === "info")?.blocks?.find((block) => block.id === type),
          type,
        ),
      ),
    ];

    expect(texts.length).toBeGreaterThan(40);
    expect(texts).toEqual(translated(texts));
  });

  it("shows the header's and footer's translatable texts of a draft in the current language", () => {
    const footer = settingsOf(schemas, schemas.sections["site-footer"]);
    const menu = settingsOf(schemas, schemas.blocks["footer-menu"]);
    const announcement = settingsOf(schemas, schemas.blocks.announcement);
    useThemeSnapshot().setDraft({
      header: {
        content: [
          {
            id: "bar",
            type: "announcement-bar",
            blocks: [{ id: "a1", type: "announcement", ...withTexts(announcement, "announcement") }],
          },
        ],
      },
      footer: {
        content: [
          {
            id: "footer",
            type: "site-footer",
            ...withTexts(footer, "site-footer"),
            blocks: [{ id: "m1", type: "footer-menu", ...withTexts(menu, "footer-menu") }],
          },
        ],
      },
    });

    const { groups } = useThemeGroups();
    const [bar] = groups.value.header;
    const [siteFooter] = groups.value.footer;
    const texts = [
      ...shownTexts(announcement, bar.blocks?.[0], "announcement"),
      ...shownTexts(footer, siteFooter, "site-footer"),
      ...shownTexts(menu, siteFooter.blocks?.[0], "footer-menu"),
    ];

    expect(texts).toHaveLength(4);
    expect(texts).toEqual(translated(texts));
  });

  it("keeps a plain text the same in every language", () => {
    useThemeSnapshot().setDraft({ templates: {} });
    useThemeTemplates().setOpenTemplate("product", {
      settings: {},
      content: [{ id: "s1", type: "slider", title: "Sale", slides: [{ title: "Printers", url: "/printers" }] }],
    });

    const [slider] = useThemeTemplates().resolveTemplate("product", { categoryPaths: [], properties: [] }).document
      .content;

    expect(slider).toMatchObject({ title: "Sale", slides: [{ title: "Printers", url: "/printers" }] });
  });
});
