import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { useThemeTemplates } from "@/shared/static-content";
import { isPreviewV2Message } from "./builder-preview.protocol";
import { findEditableElement, findEditableTexts, InlineTextEditor } from "./inline-text-editor";
import { buildPreviewCatalog, createPreviewV2, findSchemaField, PREVIEW_PROTOCOL } from "./preview-v2";
import type { IRenderMessage } from "./builder-preview.protocol";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";

const setColorModeOverride = vi.hoisted(() => vi.fn());

vi.mock("@/core/composables/useDarkMode", () => ({ useDarkMode: () => ({ setColorModeOverride }) }));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ currentLanguage: ref({ cultureName: "en-US" }), defaultStoreCulture: ref("en-US") }),
}));
vi.mock("@/core/composables/useWhiteLabeling", async () => {
  const { computed } = await import("vue");
  return { useWhiteLabeling: () => ({ themeFieldsSetByWhiteLabeling: computed(() => ["brand.logoUrl"]) }) };
});

const SCHEMAS = {
  sections: {
    banner: { settings: [{ id: "title", type: "string", translatable: true }] },
    title: { includeShared: ["title"], settings: [{ id: "subtitle", type: "string" }] },
  },
  blocks: {
    "footer-menu": {
      settings: [
        { id: "heading", type: "string", translatable: true },
        { id: "links", type: "list", element: [{ id: "label", type: "string", translatable: true }] },
        { id: "columns", type: "select" },
      ],
    },
  },
  shared: { title: { settings: [{ id: "title", type: "string" }] } },
  objects: {},
  templates: {},
  settingsSchema: {},
} as unknown as PageBuilderSchemaType;

const DOCUMENT = { settings: {}, content: [{ id: "s1", type: "banner", title: "Hello" }] };

function createPreview(options: { hasPreviewToken?: boolean } = {}) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/:path(.*)", component: {} }] });
  const blocker = document.createElement("div");
  const post = vi.fn();
  const renderPage = vi.fn(() => Promise.resolve());
  const allowNavigation = vi.fn();
  document.body.style.visibility = "hidden";

  const preview = createPreviewV2({
    router,
    body: document.body,
    blocker,
    schemas: () => SCHEMAS,
    post,
    renderPage,
    allowNavigation,
    applyLocale: () => Promise.resolve(),
    hasPreviewToken: () => !!options.hasPreviewToken,
    enqueue: (task: () => Promise<void>) => void task(),
  });

  return { preview, router, blocker, post, renderPage, allowNavigation };
}

function render(message: Partial<IRenderMessage> = {}): IRenderMessage {
  return { type: "render", document: DOCUMENT, cultureName: "en-US", ...message };
}

describe("preview protocol 2", () => {
  beforeEach(() => {
    useThemeSnapshot().setPublished(null);
    useThemeSnapshot().setDraft(undefined);
    useThemeTemplates().setOpenTemplate(undefined);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("announces the protocol, the capabilities, the conditions and a catalog hash", () => {
    const catalog = buildPreviewCatalog(SCHEMAS);
    const changed = buildPreviewCatalog({ ...SCHEMAS, sections: {} });

    expect(catalog).toMatchObject({ protocol: PREVIEW_PROTOCOL, sections: SCHEMAS.sections });
    expect(catalog.capabilities).toEqual(expect.arrayContaining(["templates", "inline-edit", "inspector"]));
    expect((catalog.conditions as { name: string }[]).map(({ name }) => name)).toContain("inCategory");
    expect(catalog.paletteTokens).toMatchObject({ light: expect.arrayContaining(["color_primary_500"]) });
    expect(catalog.hash).toBe(buildPreviewCatalog(SCHEMAS).hash);
    expect(changed.hash).not.toBe(catalog.hash);
  });

  it.each([
    [{ type: "render", document: DOCUMENT, cultureName: "en-US" }, true],
    [{ type: "render", document: DOCUMENT, cultureName: "en-US", url: "https://evil.example.com" }, false],
    [{ type: "render", document: { content: [] }, cultureName: "en-US" }, false],
    [{ type: "inspector", enabled: true }, true],
    [{ type: "inspector", enabled: "yes" }, false],
    [{ type: "colorScheme", scheme: "dark" }, true],
    [{ type: "colorScheme", scheme: "sepia" }, false],
    [{ type: "draft", theme: {} }, true],
  ])("takes %j as a message: %s", (message, expected) => {
    expect(isPreviewV2Message({ source: "builder", ...message })).toBe(expected);
  });

  it("stays blank, anonymous and blocked until the first render", async () => {
    const { preview, blocker } = createPreview();

    expect(blocker.style.pointerEvents).toBe("auto");
    expect(document.body.style.visibility).toBe("hidden");

    preview.setInspector(false);
    expect(blocker.style.pointerEvents).toBe("auto");

    await preview.handleRender(render());
    expect(document.body.style.visibility).toBe("visible");
    expect(blocker.style.pointerEvents).toBe("none");
  });

  it("keeps clicks blocked with the inspector off while impersonating a user", async () => {
    const { preview, blocker } = createPreview({ hasPreviewToken: true });

    await preview.handleRender(render());
    preview.setInspector(false);

    expect(blocker.style.pointerEvents).toBe("auto");
  });

  it("renders a page on the preview route, and a template on the storefront page it names", async () => {
    const { preview, renderPage, router, allowNavigation } = createPreview();

    await preview.handleRender(render({ page: { permalink: "/about", objectType: "Pages" } }));
    expect(renderPage).toHaveBeenCalledOnce();

    await preview.handleRender(render({ templateKey: "product.b2c", url: "/printers/x1" }));
    expect(allowNavigation).toHaveBeenCalledWith("/printers/x1");
    expect(router.currentRoute.value.fullPath).toBe("/printers/x1");
    expect(useThemeTemplates().resolveTemplate("product", {}).template).toBe("product.b2c");
  });

  it("reports the template a page chose with the fields white-labeling set", async () => {
    const { preview, post } = createPreview();
    await preview.handleRender(render());

    useThemeTemplates().setLastResolution({
      pageType: "page",
      template: "page.landing",
      ruleId: "landing",
      document: DOCUMENT,
    });
    await flushPromises();

    expect(post).toHaveBeenCalledWith("resolved", {
      url: "/",
      pageType: "page",
      template: "page.landing",
      ruleId: "landing",
      overriddenByWhiteLabeling: ["brand.logoUrl"],
    });
  });

  it("shows the add-section model at the end of a template, as on a page", async () => {
    const { preview } = createPreview();

    await preview.handleRender(render({ templateKey: "product", url: "/x1", model: { type: "banner", title: "New" } }));

    const content = useThemeTemplates().resolveTemplate("product", {}).document.content;
    expect(content.at(-2)).toMatchObject({ type: "banner", title: "New" });
  });

  it("does not report the previous product's template for a product that has not chosen yet", async () => {
    const { preview, post } = createPreview();
    await preview.handleRender(render({ templateKey: "product", url: "/printers/x1" }));
    useThemeTemplates().setLastResolution({
      pageType: "product",
      template: "product.b2c",
      ruleId: "b2c",
      document: DOCUMENT,
    });
    await flushPromises();
    post.mockClear();

    await preview.handleRender(render({ templateKey: "product", url: "/printers/x2" }));
    await flushPromises();

    expect(post).not.toHaveBeenCalledWith("resolved", expect.anything());
  });

  it("loads the page it shows again after the designer switches the user", async () => {
    const { preview, router } = createPreview();
    await preview.handleRender(render({ templateKey: "product", url: "/printers/x1" }));
    const visited: string[] = [];
    router.afterEach((to) => visited.push(to.fullPath));

    await preview.reload();

    expect(visited).toEqual(["/designer-preview", "/printers/x1"]);
  });

  it("switches between light and dark", () => {
    createPreview().preview.setColorScheme("dark");

    expect(setColorModeOverride).toHaveBeenCalledWith("dark");
  });
});

describe("inline editing", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("finds the plain-text settings of a section and its blocks, not links or markup", () => {
    const texts = findEditableTexts({
      id: "s1",
      type: "banner",
      title: "Hello",
      link: "/sale",
      html: "<b>x</b>",
      blocks: [{ id: "b1", type: "item", links: [{ label: "Sale" }] }],
    });

    expect(texts).toEqual([
      { itemId: "s1", path: ["title"], value: "Hello" },
      { itemId: "b1", path: ["links", 0, "label"], value: "Sale" },
    ]);
  });

  it("finds only the settings the schema has as plain text", () => {
    const texts = findEditableTexts(
      { id: "b1", type: "footer-menu", heading: "Shop", columns: "3", links: [{ label: "Sale" }] },
      (itemType, path) => findSchemaField(SCHEMAS, itemType, path)?.type === "string",
    );

    expect(texts.map(({ path }) => path)).toEqual([["heading"], ["links", 0, "label"]]);
  });

  it("finds a translatable setting inside a list by its element's schema", () => {
    expect(findSchemaField(SCHEMAS, "footer-menu", ["links", 0, "label"])?.translatable).toBe(true);
    expect(findSchemaField(SCHEMAS, "footer-menu", ["columns"])?.translatable).toBeUndefined();
  });

  it("finds a setting a section takes from a shared group it includes", () => {
    expect(findSchemaField(SCHEMAS, "title", ["title"])?.type).toBe("string");
    expect(findSchemaField(SCHEMAS, "title", ["subtitle"])?.type).toBe("string");
  });

  it("edits the text as stored, ends when focus leaves it and keeps a click inside from acting", () => {
    document.body.innerHTML = `<section data-pb-section="s1"><a href="/sale"><span id="title">Hello</span></a></section>`;
    const title = document.getElementById("title") as HTMLElement;
    title.style.textTransform = "uppercase";
    document.elementsFromPoint = () => [title];
    const onEnd = vi.fn();
    const editor = new InlineTextEditor(document.createElement("div"), vi.fn(), onEnd);

    editor.start([{ itemId: "s1", path: ["title"], value: "Hello" }], 0, 0);
    expect(title.style.textTransform).toBe("none");

    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    title.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);

    title.dispatchEvent(new FocusEvent("blur"));
    expect(editor.isEditing).toBe(false);
    expect(onEnd).toHaveBeenCalledOnce();
    expect(title.style.textTransform).toBe("uppercase");
  });

  it("gives the page back the text node it renders into when editing replaced it", () => {
    document.body.innerHTML = `<section data-pb-section="s1"><h2 id="title">Hello</h2></section>`;
    const title = document.getElementById("title") as HTMLElement;
    const rendered = title.firstChild as Text;
    document.elementsFromPoint = () => [title];
    const editor = new InlineTextEditor(document.createElement("div"), vi.fn(), vi.fn());

    editor.start([{ itemId: "s1", path: ["title"], value: "Hello" }], 0, 0);
    title.replaceChildren(document.createTextNode("Typed"));
    editor.end();

    expect(title.firstChild).toBe(rendered);
    expect(title.textContent).toBe("Typed");

    rendered.nodeValue = "From the panel";
    expect(title.textContent).toBe("From the panel");
  });

  it("edits the element a data-pb-field names, else the one whose text exactly one setting has", () => {
    document.body.innerHTML = `
      <section data-pb-section="s1">
        <h2><span id="title">Hello</span></h2>
        <p data-pb-field="subtitle" id="subtitle">Formatted <b>text</b></p>
        <p id="twice">Same</p>
      </section>`;
    const texts = [
      { itemId: "s1", path: ["title"], value: "Hello" },
      { itemId: "s1", path: ["subtitle"], value: "Formatted text" },
      { itemId: "s1", path: ["a"], value: "Same" },
      { itemId: "s1", path: ["b"], value: "Same" },
    ];

    expect(findEditableElement(document.getElementById("title"), texts)?.text.path).toEqual(["title"]);
    expect(findEditableElement(document.querySelector("#subtitle b"), texts)?.text.path).toEqual(["subtitle"]);
    expect(findEditableElement(document.getElementById("twice"), texts)).toBeNull();
  });
});
