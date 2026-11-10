import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { darkPresets, presets } from "@/assets/presets";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { useTemplateResolution, useThemeTemplates } from "@/shared/static-content";
import { isPreviewV2Message } from "./builder-preview.protocol";
import { findEditableElement, findEditableTexts, InlineTextEditor } from "./inline-text-editor";
import { buildPreviewCatalog, createPreviewV2, findSchemaField, isPlainTextSetting } from "./preview-v2";
import { guardPreviewNavigation, installPageInputGuard, PREVIEW_PROTOCOL } from "./utils";
import type { IRenderMessage } from "./builder-preview.protocol";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { VueWrapper } from "@vue/test-utils";

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
    banner: {
      settings: [
        { id: "title", type: "string", translatable: true },
        { id: "subtitle", type: "string", multiline: true },
      ],
    },
    title: { includeShared: ["title"], settings: [{ id: "subtitle", type: "string" }] },
  },
  blocks: {
    "footer-menu": {
      settings: [
        { id: "heading", type: "string", translatable: true },
        {
          id: "links",
          type: "list",
          element: [
            { id: "label", type: "string", translatable: true },
            { id: "link", type: "string", format: "url" },
          ],
        },
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
  let previousPage: VueWrapper | undefined;

  beforeEach(() => {
    useThemeSnapshot().setPublished(null);
    useThemeSnapshot().setDraft(undefined);
    useThemeTemplates().setOpenTemplate(undefined);
  });

  afterEach(() => {
    previousPage?.unmount();
    previousPage = undefined;
    delete (document as Partial<Document>).elementsFromPoint;
    document.body.innerHTML = "";
  });

  it("announces the protocol, the capabilities, the conditions, the built-in templates and a catalog hash", () => {
    const catalog = buildPreviewCatalog(SCHEMAS);
    const changed = buildPreviewCatalog({ ...SCHEMAS, sections: {} });

    expect(catalog).toMatchObject({ protocol: PREVIEW_PROTOCOL, sections: SCHEMAS.sections });
    expect(catalog.capabilities).toEqual(expect.arrayContaining(["templates", "inline-edit", "inspector"]));
    expect(catalog.builtInTemplates).toEqual(expect.arrayContaining(["product", "product.b2c"]));
    expect((catalog.conditions as { name: string }[]).map(({ name }) => name)).toContain("inCategory");
    expect(catalog.hash).toBe(buildPreviewCatalog(SCHEMAS).hash);
    expect(changed.hash).not.toBe(catalog.hash);
  });

  it("announces every token a built-in light or dark preset sets, sorted", () => {
    const { light, dark } = buildPreviewCatalog(SCHEMAS).paletteTokens as { light: string[]; dark: string[] };

    expect(light).toEqual(expect.arrayContaining(["color_primary_500", "color_body_bg", "color_empty_list_icon"]));
    expect(dark).toEqual(expect.arrayContaining(["color_footer_bottom_bg", "color_vc_icon_surface_primary"]));

    for (const [tokens, presetsByName] of [
      [light, presets],
      [dark, darkPresets],
    ] as const) {
      expect(new Set(tokens)).toEqual(new Set(Object.values(presetsByName).flatMap((preset) => Object.keys(preset))));
      expect(tokens.every((token, index) => index === 0 || tokens[index - 1].localeCompare(token) < 0)).toBe(true);
    }
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

  it("keeps keys, the clicks they make and submits off the page while impersonating, but lets Tab move on", async () => {
    const { preview, blocker } = createPreview({ hasPreviewToken: true });
    document.body.innerHTML = `<form id="form"><button id="add" type="button">Add to cart</button></form>`;
    document.body.append(blocker);
    installPageInputGuard(blocker, preview.isPageInputAllowed);
    const button = document.getElementById("add") as HTMLButtonElement;
    const onClick = vi.fn();
    button.addEventListener("click", onClick);
    await preview.handleRender(render());
    preview.setInspector(false);

    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    const submit = new Event("submit", { bubbles: true, cancelable: true });
    button.dispatchEvent(enter);
    button.dispatchEvent(tab);
    button.click();
    document.getElementById("form")?.dispatchEvent(submit);

    expect(enter.defaultPrevented).toBe(true);
    expect(tab.defaultPrevented).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    expect(submit.defaultPrevented).toBe(true);
  });

  it("leaves keys and clicks to the page with the inspector off", async () => {
    const { preview, blocker } = createPreview();
    document.body.innerHTML = `<button id="add" type="button">Add to cart</button>`;
    document.body.append(blocker);
    installPageInputGuard(blocker, preview.isPageInputAllowed);
    const button = document.getElementById("add") as HTMLButtonElement;
    const onClick = vi.fn();
    button.addEventListener("click", onClick);
    await preview.handleRender(render());
    preview.setInspector(false);

    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    button.dispatchEvent(enter);
    button.click();

    expect(enter.defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps a link the router does not take from loading another document, with the inspector off", async () => {
    const { preview, blocker } = createPreview();
    document.body.innerHTML = `
      <a id="external" href="https://example.com/">Out</a>
      <a id="same">Here</a>
      <a id="fragment" href="#reviews">Reviews</a>
      <a id="window" href="https://example.com/" target="_blank" rel="noopener noreferrer">New tab</a>
    `;
    document.getElementById("same")?.setAttribute("href", globalThis.location.pathname);
    document.body.append(blocker);
    await preview.handleRender(render());
    preview.setInspector(false);

    function isFollowed(id: string): boolean {
      const click = new MouseEvent("click", { bubbles: true, cancelable: true });
      document.getElementById(id)?.dispatchEvent(click);
      return !click.defaultPrevented;
    }

    expect(isFollowed("external")).toBe(false);
    expect(isFollowed("same")).toBe(false);
    expect(isFollowed("fragment")).toBe(true);
    expect(isFollowed("window")).toBe(true);
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

  it("keeps a page it renders after a template on the preview route when a link there names the template's page", async () => {
    const { preview, router, renderPage, allowNavigation } = createPreview();
    let allowedNavigation: string | undefined;
    allowNavigation.mockImplementation((url?: string) => {
      allowedNavigation = url;
    });
    router.beforeEach((to, from, next) => guardPreviewNavigation(to, from, next, allowedNavigation));
    renderPage.mockImplementation(async () => {
      await router.push("/designer-preview");
    });

    await preview.handleRender(render({ templateKey: "product", url: "/printers" }));
    await preview.handleRender(render());
    await router.push("/printers");

    expect(router.currentRoute.value.path).toBe("/designer-preview");
  });

  it("reports the template a page chose with the fields white-labeling set", async () => {
    const { preview, post } = createPreview();
    await preview.handleRender(render());

    useThemeTemplates().setLastResolution({
      pageType: "page",
      template: "page.landing",
      ruleId: "landing",
      document: DOCUMENT,
      rules: { template: "page.landing", ruleId: "landing" },
    });
    await flushPromises();

    expect(post).toHaveBeenCalledWith("resolved", {
      url: "/",
      pageType: "page",
      template: "page.landing",
      ruleId: "landing",
      rules: { template: "page.landing", ruleId: "landing" },
      overriddenByWhiteLabeling: ["brand.logoUrl"],
    });
  });

  it("reports what the draft's rules pick for the page while another template is open", async () => {
    const { preview, post } = createPreview();
    useThemeSnapshot().setDraft({ rules: { version: 2, product: [{ id: "all", template: "product.b2c" }] } });
    await preview.handleRender(render({ templateKey: "product", url: "/printers/x1" }));

    useThemeTemplates().setLastResolution(useThemeTemplates().resolveTemplate("product", {}));
    await flushPromises();

    const [, data] = post.mock.calls.filter(([type]) => type === "resolved").at(-1) ?? [];
    expect(data).toMatchObject({
      url: "/printers/x1",
      template: "product",
      ruleId: null,
      rules: { template: "product.b2c", ruleId: "all" },
    });
    expect(() => structuredClone(data)).not.toThrow();

    useThemeTemplates().setOpenTemplate(undefined);
    expect(useThemeTemplates().resolveTemplate("product", {})).toMatchObject({
      template: "product.b2c",
      ruleId: "all",
      rules: { template: "product.b2c", ruleId: "all" },
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
    // The previous product's page stays mounted, still choosing for its own product, until the next one loads.
    previousPage = mount(
      defineComponent({
        setup() {
          useTemplateResolution("product", {});
          return () => null;
        },
      }),
    );
    await flushPromises();
    expect(post).toHaveBeenCalledWith("resolved", expect.objectContaining({ url: "/printers/x1" }));
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

  it("shows the newest render after an inline edit during which the designer switched the user", async () => {
    const { preview, blocker, renderPage } = createPreview();
    preview.setInspector(true);
    await preview.handleRender(render());
    const section = document.createElement("section");
    section.dataset.pbSection = "s1";
    const title = section.appendChild(document.createElement("h2"));
    title.textContent = "Hello";
    document.body.append(section);
    document.elementsFromPoint = () => [title];
    blocker.dispatchEvent(new MouseEvent("click", { clientX: 0, clientY: 0 }));
    const typed = { settings: {}, content: [{ id: "s1", type: "banner", title: "Hello there" }] };

    await preview.handleRender(render({ document: typed }));
    await preview.reload();
    expect(renderPage).toHaveBeenCalledOnce();

    title.dispatchEvent(new FocusEvent("blur"));
    await flushPromises();

    expect(renderPage).toHaveBeenLastCalledWith(expect.objectContaining({ document: typed }));
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
    const texts = findEditableTexts(
      {
        id: "s1",
        type: "banner",
        title: "Hello",
        link: "/sale",
        html: "<b>x</b>",
        blocks: [{ id: "b1", type: "footer-menu", links: [{ label: "Sale" }] }],
      },
      (itemType, path) => isPlainTextSetting(SCHEMAS, itemType, path),
      () => false,
    );

    expect(texts).toEqual([
      { itemId: "s1", path: ["title"], value: "Hello", multiline: false },
      { itemId: "b1", path: ["links", 0, "label"], value: "Sale", multiline: false },
    ]);
  });

  it("finds only the settings the schema has as plain text, not links", () => {
    const texts = findEditableTexts(
      { id: "b1", type: "footer-menu", heading: "Shop", columns: "3", links: [{ label: "Sale", link: "sale" }] },
      (itemType, path) => isPlainTextSetting(SCHEMAS, itemType, path),
      () => false,
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

  it("joins pasted lines of a single-line text with one space each", () => {
    document.body.innerHTML = `<section data-pb-section="s1"><h2 id="title">Hello</h2></section>`;
    const title = document.getElementById("title") as HTMLElement;
    document.elementsFromPoint = () => [title];
    const onEdit = vi.fn();
    const editor = new InlineTextEditor(document.createElement("div"), onEdit, vi.fn());

    editor.start([{ itemId: "s1", path: ["title"], value: "Hello" }], 0, 0);
    title.textContent = "Line A\nLine B\n\n  Line C";
    title.dispatchEvent(new Event("input"));

    expect(onEdit).toHaveBeenLastCalledWith({ itemId: "s1", path: ["title"], value: "Line A Line B Line C" });
  });

  async function editTitle(typed: string) {
    const preview = createPreview();
    preview.preview.setInspector(true);
    await preview.preview.handleRender(render());
    document.body.innerHTML = `<section data-pb-section="s1"><h2 id="title">Hello</h2></section>`;
    const title = document.getElementById("title") as HTMLElement;
    document.elementsFromPoint = () => [title];
    preview.blocker.dispatchEvent(new MouseEvent("click", { clientX: 0, clientY: 0 }));
    (title.firstChild as Text).nodeValue = typed;
    title.dispatchEvent(new Event("input"));
    title.dispatchEvent(new FocusEvent("blur"));

    return { ...preview, title };
  }

  it("takes a refused edit's text back when the designer answers with the old value", async () => {
    const { preview, title } = await editTitle("Hello there");
    expect(title.textContent).toBe("Hello there");

    await preview.handleRender(render());

    expect(title.textContent).toBe("Hello");
  });

  it("keeps an accepted edit's text until and after the designer's answer", async () => {
    const { preview, title } = await editTitle("Hello there");
    const typed = { settings: {}, content: [{ id: "s1", type: "banner", title: "Hello there" }] };

    preview.applyDraft({});
    expect(title.textContent).toBe("Hello there");

    await preview.handleRender(render({ document: typed }));
    expect(title.textContent).toBe("Hello there");
  });

  it("takes a line break in a multiline setting that holds one line", async () => {
    const { preview, blocker, post } = createPreview();
    preview.setInspector(true);
    await preview.handleRender(
      render({ document: { settings: {}, content: [{ id: "s1", type: "banner", subtitle: "One line" }] } }),
    );
    document.body.innerHTML = `<section data-pb-section="s1"><p id="subtitle">One line</p></section>`;
    const subtitle = document.getElementById("subtitle") as HTMLElement;
    document.elementsFromPoint = () => [subtitle];
    blocker.dispatchEvent(new MouseEvent("click", { clientX: 0, clientY: 0 }));

    const enter = new KeyboardEvent("keydown", { key: "Enter", cancelable: true });
    subtitle.dispatchEvent(enter);
    subtitle.textContent = "One line\nTwo lines";
    subtitle.dispatchEvent(new Event("input"));
    subtitle.dispatchEvent(new FocusEvent("blur"));

    expect(enter.defaultPrevented).toBe(false);
    expect(post).toHaveBeenCalledWith(
      "edit",
      expect.objectContaining({ itemId: "s1", path: ["subtitle"], value: "One line\nTwo lines" }),
    );
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

  it("edits the one of two settings with the same text that a data-pb-field names, where it shows the text", () => {
    document.body.innerHTML = `
      <section data-pb-section="s1">
        <a data-pb-field="buttons.0.label"><span>More</span></a>
        <a data-pb-field="buttons.1.label"><span id="second">More</span></a>
      </section>`;
    const texts = [
      { itemId: "s1", path: ["buttons", 0, "label"], value: "More" },
      { itemId: "s1", path: ["buttons", 1, "label"], value: "More" },
    ];
    const second = document.getElementById("second");

    const found = findEditableElement(second, texts);

    expect(found?.element).toBe(second);
    expect(found?.text.path).toEqual(["buttons", 1, "label"]);
  });

  it("tells the same setting of two blocks apart by the block its text is in", () => {
    document.body.innerHTML = `
      <section data-pb-section="s1">
        <div data-pb-section="b1"><h3 data-pb-field="heading">Delivery</h3></div>
        <div data-pb-section="b2"><h3 data-pb-field="heading" id="heading">Delivery</h3></div>
      </section>`;
    const texts = [
      { itemId: "b1", path: ["heading"], value: "Delivery" },
      { itemId: "b2", path: ["heading"], value: "Delivery" },
    ];

    expect(findEditableElement(document.getElementById("heading"), texts)?.text.itemId).toBe("b2");
  });

  it("matches a text by its content only to the settings no element names", () => {
    document.body.innerHTML = `
      <section data-pb-section="s1">
        <h2 id="title">Fast</h2>
        <div data-pb-field="columns.0.title">Fast</div>
      </section>`;
    const texts = [
      { itemId: "s1", path: ["title"], value: "Fast" },
      { itemId: "s1", path: ["columns", 0, "title"], value: "Fast" },
    ];

    expect(findEditableElement(document.getElementById("title"), texts)?.text.path).toEqual(["title"]);
  });

  it("takes a plain string of the schema with any characters, but not an address", () => {
    const item = {
      id: "s1",
      type: "promo",
      title: "Hit #1",
      code: "SALE_2026",
      url: "/catalog",
      link: "https://a.io/b",
    };

    const texts = findEditableTexts(
      item,
      () => true,
      () => false,
    );

    expect(texts.map(({ path }) => path)).toEqual([["title"], ["code"]]);
  });
});
