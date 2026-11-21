import { enableAutoUnmount, flushPromises, mount, RouterLinkStub } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { VcBadge, VcButton, VcIcon } from "@/ui-kit/components";
import {
  registerCustomSectionBehavior,
  registerCustomSectionTag,
  unregisterCustomSectionBehavior,
  unregisterCustomSectionTag,
} from "../kit";
import SbSection from "./sb-section.vue";
import type { ICustomSectionDefinition, IThemeSchemaField } from "@/core/theme-snapshot";

const frame = vi.hoisted(() => ({ isPreview: false }));

vi.mock("@/core/theme-snapshot/designer-frame", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core/theme-snapshot/designer-frame")>()),
  isPreviewV2Frame: () => frame.isPreview,
}));

vi.mock("./sb-products.vue", async () => {
  const vue = await import("vue");
  return {
    __esModule: true,
    default: vue.defineComponent({
      name: "SbProductsStub",
      props: ["query", "filter", "take", "view", "columns"],
      setup: () => () => vue.h("div"),
    }),
  };
});

const TYPE = "custom-test";
const ASSETS = "https://cdn.example.com/assets";
/** Apart, since check-css-important reads `!word` in markup as an important utility. */
const NOT = "!";

const FIELDS: IThemeSchemaField[] = [
  { id: "title", type: "string" },
  { id: "link", type: "string", format: "url" },
  { id: "body", type: "text" },
  { id: "image", type: "images" },
  { id: "accent", type: "color-token" },
  { id: "speed", type: "slider" },
  { id: "show_badge", type: "checkbox" },
  {
    id: "cards",
    type: "list",
    element: [
      { id: "title", type: "string" },
      { id: "link", type: "string", format: "url" },
      { id: "featured", type: "checkbox" },
    ],
  },
];

function mountSection(
  template: string,
  settings: Record<string, unknown> = {},
  definition?: Partial<ICustomSectionDefinition>,
  assetsBaseUrl = ASSETS,
) {
  useThemeSnapshot().setPublished({
    storeId: "store",
    cultureName: "en-US",
    publication: 1,
    snapshot: { format: 1, publication: 1, cultureName: "en-US", templates: {}, assetsBaseUrl },
    menus: [],
  });
  useThemeSnapshot().setDraft({
    customSections: {
      [TYPE]: { format: 1, name: "Test", schema: { settings: FIELDS }, css: "", template, ...definition },
    },
  });

  return mount(SbSection, {
    props: { model: { id: "section-1", type: TYPE, ...settings } },
    attrs: { id: "anchor-1" },
    global: { stubs: { RouterLink: RouterLinkStub, VcIcon: true } },
  });
}

enableAutoUnmount(afterEach);

describe("SbSection", () => {
  beforeEach(() => {
    frame.isPreview = false;
    useThemeSnapshot().setDraft(undefined);
  });

  describe("bindings", () => {
    it("inserts a setting as text, never as HTML", () => {
      const wrapper = mountSection("<section><h2>{{ settings.title }}!</h2></section>", {
        title: "<b>Bold</b>",
      });

      expect(wrapper.find("h2").text()).toBe("<b>Bold</b>!");
      expect(wrapper.find("b").exists()).toBe(false);
    });

    it("binds a setting in an attribute value", () => {
      const wrapper = mountSection('<section><img alt="{{ settings.title }} photo" src="/a.png"></section>', {
        title: "Team",
      });

      expect(wrapper.find("img").attributes("alt")).toBe("Team photo");
    });

    it("leaves out a binding of a setting the schema does not declare", () => {
      const wrapper = mountSection(
        "<section><p>[{{ settings.secret }}][{{ item.title }}][{{ window }}]</p></section>",
        {
          secret: "hidden",
        },
      );

      expect(wrapper.find("p").text()).toBe("[][][]");
    });
  });

  describe("the root", () => {
    it("gets the type and a variable per setting the CSS can use", () => {
      const wrapper = mountSection("<section></section>", {
        accent: "color_primary_500",
        image: `${ASSETS}/hero.png`,
        speed: 3,
        show_badge: true,
      });
      const root = wrapper.find("section");

      expect(root.attributes("data-sb-type")).toBe(TYPE);
      expect(root.element.style.getPropertyValue("--setting-accent")).toBe("var(--color-primary-500)");
      expect(root.element.style.getPropertyValue("--setting-image")).toBe(`url("${ASSETS}/hero.png")`);
      expect(root.element.style.getPropertyValue("--setting-speed")).toBe("3");
      expect(root.element.style.getPropertyValue("--setting-show-badge")).toBe("1");
    });

    it("sets no variable for an image that breaks the image rule", () => {
      const root = mountSection("<section></section>", { image: "javascript:alert(1)" }).find("section");

      expect(root.element.style.getPropertyValue("--setting-image")).toBe("");
    });

    it("renders nothing for a template without exactly one root element", () => {
      const wrapper = mountSection("<section></section><section></section>");

      expect(wrapper.find("section").exists()).toBe(false);
    });

    it("renders nothing for a type the theme does not hold", () => {
      useThemeSnapshot().setDraft({ customSections: {} });

      const wrapper = mount(SbSection, { props: { model: { id: "section-1", type: TYPE } } });

      expect(wrapper.find("[data-sb-type]").exists()).toBe(false);
    });
  });

  describe("containment", () => {
    it("puts the section in a box of the storefront's, outside the root its CSS is scoped to, with the section's attributes", () => {
      const wrapper = mountSection("<section></section>");

      expect(wrapper.element.className).toBe("sb-section");
      expect(wrapper.attributes("id")).toBe("anchor-1");
      expect(wrapper.attributes("data-sb-type")).toBeUndefined();
      expect(wrapper.element.firstElementChild?.getAttribute("data-sb-type")).toBe(TYPE);
    });

    it("keeps only the type's own classes, none of the storefront's utilities", () => {
      const wrapper = mountSection(
        `<section class="${TYPE} ${TYPE}--dark fixed z-50"><p class="${TYPE}__title inset-0 {{ settings.title }}">a</p><p class="top-0">b</p></section>`,
        { title: `${TYPE}-bound bg-black` },
      );
      const [title, utility] = wrapper.findAll("p");

      expect(wrapper.find("section").classes()).toEqual([TYPE, `${TYPE}--dark`]);
      expect(title.classes()).toEqual([`${TYPE}__title`, `${TYPE}-bound`]);
      expect(utility.attributes("class")).toBeUndefined();
    });

    it("leaves out what is nested more than 32 elements deep, the root included", () => {
      const depth = 40;
      const wrapper = mountSection(`<section>${"<div>".repeat(depth)}deep${"</div>".repeat(depth)}</section>`);

      expect(wrapper.findAll("section div")).toHaveLength(31);
      expect(wrapper.text()).not.toContain("deep");
    });
  });

  describe("data-each", () => {
    it("repeats the element per row, with the row's fields and its position", () => {
      const wrapper = mountSection('<ul><li data-each="settings.cards" class="card">{{ item.title }}</li></ul>', {
        cards: [{ title: "One" }, { title: "Two" }, "not a row"],
      });
      const cards = wrapper.findAll("li");

      expect(cards.map((card) => card.text())).toEqual(["One", "Two"]);
      expect(cards.map((card) => card.element.style.getPropertyValue("--i"))).toEqual(["0", "1"]);
      expect(cards.map((card) => card.element.style.getPropertyValue("--n"))).toEqual(["2", "2"]);
      expect(cards[0].attributes("data-each")).toBeUndefined();
    });

    it("renders a nested repeat once, in the row of the outer one", () => {
      const wrapper = mountSection(
        '<ul><li data-each="settings.cards"><span data-each="settings.cards">{{ item.title }}</span></li></ul>',
        { cards: [{ title: "One" }, { title: "Two" }] },
      );

      expect(wrapper.findAll("span").map((span) => span.text())).toEqual(["One", "Two"]);
    });

    it("renders nothing for a setting that is not a list", () => {
      const wrapper = mountSection('<ul><li data-each="settings.title">x</li></ul>', { title: "Text" });

      expect(wrapper.find("li").exists()).toBe(false);
    });
  });

  describe("data-if", () => {
    it.each([
      { value: "Shown", isShown: true },
      { value: 0, isShown: true },
      { value: "", isShown: false },
      { value: false, isShown: false },
      { value: null, isShown: false },
      { value: [], isShown: false },
      { value: undefined, isShown: false },
    ])("renders the element for $value: $isShown, and its negation the other way", ({ value, isShown }) => {
      const wrapper = mountSection(
        `<section><p data-if="settings.title" title="set">a</p><p data-if="${NOT}settings.title" title="unset">b</p></section>`,
        { title: value },
      );

      expect(wrapper.find('[title="set"]').exists()).toBe(isShown);
      expect(wrapper.find('[title="unset"]').exists()).toBe(!isShown);
    });

    it("reads a row's field", () => {
      const wrapper = mountSection(
        '<ul><li data-each="settings.cards"><b data-if="item.featured">★</b>{{ item.title }}</li></ul>',
        { cards: [{ title: "One", featured: true }, { title: "Two" }] },
      );

      expect(wrapper.findAll("b")).toHaveLength(1);
      expect(wrapper.findAll("li")[0].text()).toBe("★One");
    });
  });

  describe("data-html", () => {
    it("shows a text setting as sanitized HTML", () => {
      const wrapper = mountSection('<section><div data-html="settings.body">ignored</div></section>', {
        body: '<p>Hi <b>there</b></p><img src="x" onerror="alert(1)"><script>alert(1)</script>',
      });
      const html = wrapper.find("section div");

      expect(html.find("b").text()).toBe("there");
      expect(html.find("script").exists()).toBe(false);
      expect(html.find("img").attributes("onerror")).toBeUndefined();
      expect(html.text()).not.toContain("ignored");
    });

    it("shows nothing for a setting that is not rich text", () => {
      const wrapper = mountSection('<section><div data-html="settings.title"></div></section>', { title: "<b>x</b>" });

      expect(wrapper.find("section div").html()).toBe("<div></div>");
    });
  });

  describe("sanitizing", () => {
    it("drops elements the contract refuses, with the content of those that hold code", () => {
      const wrapper = mountSection(
        "<section><script>alert(1)</script><style>p{}</style><svg><circle /></svg>" +
          "<iframe src='https://evil.example'></iframe><form><input><button>Go</button></form><p>Kept</p></section>",
      );

      expect(wrapper.find("section").element.innerHTML).toBe("<p>Kept</p>");
    });

    it("drops attributes the contract refuses", () => {
      const wrapper = mountSection(
        '<section><p id="x" style="color:red" onclick="alert(1)" data-secret="1" title="Kept" aria-label="Kept">a</p></section>',
      );

      expect(wrapper.find("p").attributes()).toEqual({ title: "Kept", "aria-label": "Kept" });
    });
  });

  describe("links and images", () => {
    it.each([
      { href: "/catalog", isKept: true },
      { href: "https://example.com", isKept: true },
      { href: "mailto:sales@example.com", isKept: true },
      { href: "tel:+100", isKept: true },
      { href: "javascript:alert(1)", isKept: false },
      { href: "http://example.com", isKept: false },
      { href: "//evil.example", isKept: false },
      { href: "/\\evil.example", isKept: false },
      { href: "data:text/html,x", isKept: false },
      { href: "#pricing", isKept: true },
      { href: "#1st", isKept: false },
      { href: "#a b", isKept: false },
    ])("keeps the href $href: $isKept", ({ href, isKept }) => {
      const wrapper = mountSection('<section><a href="{{ settings.link }}">Go</a></section>', { link: href });

      expect(wrapper.find("a").attributes("href")).toBe(isKept ? href : undefined);
    });

    it("keeps only the _self and _blank targets, and no rel that hands this window over", () => {
      const wrapper = mountSection(
        '<section><a href="/a" target="_top">A</a><a href="/b" target="_self" rel="opener">B</a></section>',
      );
      const [top, opener] = wrapper.findAll("a");

      expect(top.attributes("target")).toBeUndefined();
      expect(opener.attributes()).toMatchObject({ target: "_self" });
      expect(opener.attributes("rel")).toBeUndefined();
    });

    it("keeps a link that opens a new window from reaching this one", () => {
      const wrapper = mountSection(
        '<section><a href="https://example.com" target="_blank" rel="external">Go</a></section>',
      );

      expect(wrapper.find("a").attributes("rel")).toBe("external noopener noreferrer");
    });

    it.each([
      { src: `${ASSETS}/a.png`, isKept: true },
      { src: "https://cdn.example.com/a.png", isKept: false },
      { src: `${ASSETS}/../other/a.png`, isKept: false },
      { src: "/a.png", isKept: false },
      { src: "data:image/svg+xml,<svg onload=alert(1)>", isKept: false },
      { src: "javascript:alert(1)", isKept: false },
    ])("keeps the src $src: $isKept", ({ src, isKept }) => {
      const wrapper = mountSection('<section><img src="{{ settings.image }}" alt=""></section>', { image: src });

      expect(wrapper.find("img").attributes("src")).toBe(isKept ? src : undefined);
    });

    it("keeps a video's playback attributes and poster, a source's type and media, and an open details", () => {
      const wrapper = mountSection(
        `<section><video autoplay muted loop playsinline controls preload="none" poster="${ASSETS}/p.jpg">` +
          `<source src="${ASSETS}/v.mp4" type="video/mp4" media="(min-width: 600px)"></video>` +
          "<details open><summary>More</summary>Text</details></section>",
      );
      const video = wrapper.find("video").element as HTMLVideoElement;

      expect([video.autoplay, video.muted, video.loop, video.controls]).toEqual([true, true, true, true]);
      expect(video.getAttribute("playsinline")).toBe("");
      expect(video.getAttribute("preload")).toBe("none");
      expect(video.getAttribute("poster")).toBe(`${ASSETS}/p.jpg`);
      expect(wrapper.find("source").attributes()).toEqual({
        src: `${ASSETS}/v.mp4`,
        type: "video/mp4",
        media: "(min-width: 600px)",
      });
      expect((wrapper.find("details").element as HTMLDetailsElement).open).toBe(true);
    });

    it("puts a poster through the image rule and a cite through the link rule", () => {
      const wrapper = mountSection(
        '<section><video poster="javascript:x"></video><blockquote cite="https://example.com/q">A</blockquote>' +
          '<q cite="javascript:alert(1)">B</q></section>',
      );

      expect(wrapper.find("video").attributes("poster")).toBeUndefined();
      expect(wrapper.find("blockquote").attributes("cite")).toBe("https://example.com/q");
      expect(wrapper.find("q").attributes("cite")).toBeUndefined();
    });

    it("shows no image when the published theme names no asset library", () => {
      const wrapper = mountSection(
        `<section><img src="${ASSETS}/a.png" alt=""></section>`,
        { image: `${ASSETS}/hero.png` },
        undefined,
        "",
      );

      expect(wrapper.find("img").attributes("src")).toBeUndefined();
      expect(wrapper.find("section").element.style.getPropertyValue("--setting-image")).toBe("");
    });

    it("leaves out a srcset with any candidate that breaks the rule", () => {
      const wrapper = mountSection(
        `<section><img srcset="${ASSETS}/a.png 1x, ${ASSETS}/b.png 2x" alt="">` +
          `<img srcset="${ASSETS}/a.png 1x, javascript:x 2x" alt=""></section>`,
      );
      const [kept, dropped] = wrapper.findAll("img");

      expect(kept.attributes("srcset")).toBe(`${ASSETS}/a.png 1x, ${ASSETS}/b.png 2x`);
      expect(dropped.attributes("srcset")).toBeUndefined();
    });
  });

  describe("kit tags", () => {
    it("renders vc-button as VcButton, a path as a route", () => {
      const wrapper = mountSection(
        '<section><vc-button label="{{ settings.title }}" to="/catalog" color="secondary" variant="outline" size="sm" full-width></vc-button></section>',
        { title: "Shop" },
      );
      const button = wrapper.findComponent(VcButton);

      expect(button.props()).toMatchObject({
        to: "/catalog",
        color: "secondary",
        variant: "outline",
        size: "sm",
        fullWidth: true,
      });
      expect(button.text()).toBe("Shop");
    });

    it("gives VcButton an external link and leaves out values it does not take", () => {
      const wrapper = mountSection(
        '<section><vc-button label="Go" to="https://example.com" color="hotpink" variant="weird"></vc-button><vc-button label="No" to="javascript:alert(1)"></vc-button></section>',
      );
      const [external, unsafe] = wrapper.findAllComponents(VcButton);

      expect(external.props()).toMatchObject({
        externalLink: "https://example.com",
        color: "primary",
        variant: "solid",
      });
      expect(unsafe.props()).toMatchObject({ to: null, externalLink: undefined });
    });

    it("renders vc-icon and vc-badge", () => {
      const wrapper = mountSection(
        '<section><vc-icon name="star" size="lg" color="accent"></vc-icon><vc-badge label="New" color="success" size="sm"></vc-badge></section>',
      );

      expect(wrapper.findComponent(VcIcon).props()).toMatchObject({ name: "star", size: "lg", color: "accent" });
      expect(wrapper.findComponent(VcBadge).props()).toMatchObject({ color: "success", size: "sm" });
      expect(wrapper.findComponent(VcBadge).text()).toBe("New");
    });

    it("renders what follows a kit tag written as self-closing", () => {
      const wrapper = mountSection('<section><p><vc-icon name="star" /> Rated</p></section>');

      expect(wrapper.findComponent(VcIcon).exists()).toBe(true);
      expect(wrapper.find("p").text()).toBe("Rated");
    });

    it("renders vc-products with its checked attributes", async () => {
      const wrapper = mountSection(
        '<section><vc-products query="drill" take="6" columns="5"></vc-products><vc-products view="carousel" filter="brand:acme" take="40" columns="3"></vc-products></section>',
      );
      await vi.waitFor(() => expect(wrapper.findAllComponents({ name: "SbProductsStub" })).toHaveLength(2));
      const [grid, carousel] = wrapper.findAllComponents({ name: "SbProductsStub" });

      expect(grid.props()).toEqual({ query: "drill", filter: undefined, take: 6, view: undefined, columns: 5 });
      expect(carousel.props()).toEqual({
        query: undefined,
        filter: "brand:acme",
        take: undefined,
        view: "carousel",
        columns: 3,
      });
    });
  });

  describe("in the designer preview", () => {
    beforeEach(() => {
      frame.isPreview = true;
    });

    it("names the string setting an element shows as its whole text, so it can be edited in place", () => {
      const wrapper = mountSection(
        '<section><h2> {{ settings.title }} </h2><p>Hi {{ settings.title }}</p><a href="/x">{{ settings.link }}</a>' +
          '<ul><li data-each="settings.cards">{{ item.title }}</li></ul></section>',
        { title: "Hello", link: "/x", cards: [{ title: "One" }, { title: "Two" }] },
      );

      expect(wrapper.find("h2").attributes("data-pb-field")).toBe("title");
      expect(wrapper.find("p").attributes("data-pb-field")).toBeUndefined();
      expect(wrapper.find("a").attributes("data-pb-field")).toBeUndefined();
      expect(wrapper.findAll("li").map((item) => item.attributes("data-pb-field"))).toEqual([
        "cards.0.title",
        "cards.1.title",
      ]);
    });
  });

  describe("behaviors", () => {
    it("repeats a marquee's children once, the copies hidden from assistive technology", () => {
      const wrapper = mountSection("<section><div data-marquee><span>A</span><span>B</span></div></section>");
      const items = wrapper.findAll("[data-marquee] > span");

      expect(items.map((item) => item.text())).toEqual(["A", "B", "A", "B"]);
      expect(items.map((item) => item.attributes("aria-hidden"))).toEqual([undefined, undefined, "true", "true"]);
    });

    it("leaves the text of a counter to its behavior", () => {
      const wrapper = mountSection('<section><span data-count-up="{{ settings.speed }}">placeholder</span></section>', {
        speed: 5,
      });

      expect(wrapper.find("span").attributes("data-count-up")).toBe("5");
      expect(wrapper.find("span").text()).not.toContain("placeholder");
    });

    it("applies a behavior once its chunk loads", async () => {
      const wrapper = mountSection('<section><span data-copy="{{ settings.title }}">Copy</span></section>', {
        title: "CODE10",
      });

      await vi.waitFor(() => expect(wrapper.find("span").attributes("role")).toBe("button"));
      expect(wrapper.find("span").attributes("tabindex")).toBe("0");
    });

    it("follows a changed setting", async () => {
      const wrapper = mountSection("<section><h2>{{ settings.title }}</h2></section>", { title: "Before" });

      await wrapper.setProps({ model: { id: "section-1", type: TYPE, title: "After" } });
      await nextTick();

      expect(wrapper.find("h2").text()).toBe("After");
    });
  });

  describe("a kit extended through the registry", () => {
    const Rating = defineComponent({
      name: "RatingStub",
      props: { value: { type: Number, default: 0 }, maxValue: { type: Number, default: 5 } },

      setup:
        (props, { slots }) =>
        () =>
          h("div", { "data-test-id": "rating" }, [`${props.value}/${props.maxValue}`, slots.default?.()]),
    });

    afterEach(() => {
      unregisterCustomSectionTag("vc-rating");
      unregisterCustomSectionBehavior("glow");
    });

    it("renders a tag a module registered, with its checked attributes as camelCase props", () => {
      registerCustomSectionTag("vc-rating", {
        component: Rating,
        description: "Stars.",
        attributes: {
          value: { type: "number", min: 0, max: 5 },
          "max-value": { type: "number" },
          label: { type: "string" },
        },
        slotAttribute: "label",
      });

      const wrapper = mountSection(
        '<section><vc-rating value="{{ settings.speed }}" max-value="10" label="Great" onclick="x"></vc-rating><vc-rating value="9"></vc-rating></section>',
        { speed: 4 },
      );
      const [rated, outOfRange] = wrapper.findAllComponents(Rating);

      expect(rated.props()).toEqual({ value: 4, maxValue: 10 });
      expect(rated.text()).toBe("4/10Great");
      expect(outOfRange.props("value")).toBe(0);
    });

    it("switches on a behavior a module registered, with its options in the template", async () => {
      const mounted = vi.fn();
      registerCustomSectionBehavior("glow", {
        directive: () =>
          Promise.resolve({
            mounted: (element: HTMLElement, binding) => mounted(element.dataset.glowColor, binding.value),
          }),
        description: "Glows.",
        options: { color: { type: "string" } },
      });

      mountSection(
        '<section><p data-glow="{{ settings.title }}" data-glow-color="gold" data-glow-other="x">a</p></section>',
        {
          title: "strong",
        },
      );

      await vi.waitFor(() => expect(mounted).toHaveBeenCalledWith("gold", "strong"));
    });

    it("leaves out a tag nobody registered", () => {
      const wrapper = mountSection("<section><vc-rating value='3'></vc-rating><p>Kept</p></section>");

      expect(wrapper.find("section").element.innerHTML).toBe("<p>Kept</p>");
    });
  });

  describe("against a hostile or changing draft", () => {
    afterEach(() => {
      unregisterCustomSectionTag("vc-promo-link");
    });

    it("does not nest a repeating behavior in another, so the copies cannot double at every level", () => {
      const wrapper = mountSection(
        "<section><div data-marquee><div data-marquee><div data-marquee><span>x</span></div></div></div></section>",
      );

      expect(wrapper.findAll("span")).toHaveLength(2);
      expect(wrapper.findAll("[data-marquee]")).toHaveLength(1);
    });

    it("marks the copies of a repeated list's rows, out of the tab order and hidden from assistive technology", () => {
      const wrapper = mountSection(
        '<section><ul data-marquee><li data-each="settings.cards"><a href="{{ item.link }}">{{ item.title }}</a></li></ul></section>',
        {
          cards: [
            { title: "One", link: "/one" },
            { title: "Two", link: "/two" },
          ],
        },
      );
      const rows = wrapper.findAll("li");

      expect(rows.map((row) => row.text())).toEqual(["One", "Two", "One", "Two"]);
      expect(rows.map((row) => row.attributes("data-sb-repeat"))).toEqual([undefined, undefined, "", ""]);
      expect(rows.map((row) => row.attributes("aria-hidden"))).toEqual([undefined, undefined, "true", "true"]);
      expect(rows.map((row) => row.attributes("inert"))).toEqual([undefined, undefined, "", ""]);
    });

    it("mounts a changed template afresh, so an added behavior starts instead of breaking the patch", async () => {
      const wrapper = mountSection('<section><div data-copy="a">x</div></section>');
      const before = wrapper.find("section").element;

      useThemeSnapshot().setDraft({
        customSections: {
          [TYPE]: {
            format: 1,
            name: "Test",
            schema: { settings: FIELDS },
            css: "",
            template: '<section><div data-copy="a" data-inview>x</div></section>',
          },
        },
      });
      await nextTick();

      expect(wrapper.find("section").element).not.toBe(before);
      expect(wrapper.find("[data-inview]").exists()).toBe(true);
    });

    it("keeps a row's element with the row when the rows are reordered", async () => {
      const cards = [
        { id: "a", title: "One" },
        { id: "b", title: "Two" },
      ];
      const wrapper = mountSection('<ul><li data-each="settings.cards">{{ item.title }}</li></ul>', { cards });
      const first = wrapper.find("li").element;

      await wrapper.setProps({ model: { id: "section-1", type: TYPE, cards: [...cards].reverse() } });

      expect(wrapper.findAll("li")[1].element).toBe(first);
    });

    it("checks a module tag's address attributes as links, whatever type it declares", async () => {
      const PromoLink = defineComponent({ name: "PromoLinkStub", props: ["href"], setup: () => () => h("a") });
      registerCustomSectionTag("vc-promo-link", {
        component: PromoLink,
        description: "A link.",
        attributes: { href: { type: "string" } },
      });

      const wrapper = mountSection(
        '<section><vc-promo-link href="javascript:alert(document.domain)"></vc-promo-link><vc-promo-link href="/sale"></vc-promo-link></section>',
      );
      const [unsafe, safe] = wrapper.findAllComponents(PromoLink);

      expect(unsafe.props("href")).toBeUndefined();
      expect(safe.props("href")).toBe("/sale");
    });

    it("turns a kit boolean bound to an unset setting off", () => {
      const wrapper = mountSection(
        '<section><vc-button label="A" full-width="{{ settings.title }}"></vc-button><vc-button label="B" full-width></vc-button></section>',
        { title: "" },
      );
      const [bound, written] = wrapper.findAllComponents(VcButton);

      expect(bound.props("fullWidth")).toBe(false);
      expect(written.props("fullWidth")).toBe(true);
    });

    it("leaves out a behavior's value or option its field does not take, and then its text stays", () => {
      const wrapper = mountSection(
        '<section><span data-count-up="many">many</span><p data-inview data-inview-threshold="2">x</p></section>',
      );

      expect(wrapper.find("span").attributes("data-count-up")).toBeUndefined();
      expect(wrapper.find("span").text()).toBe("many");
      expect(wrapper.find("p").attributes()).toEqual({ "data-inview": "" });
    });

    it("keeps an attribute only some elements take off every other element", () => {
      const wrapper = mountSection(
        '<section><div open autoplay muted poster="/p.jpg" cite="https://example.com" type="x" media="print">a</div></section>',
      );

      expect(wrapper.find("section div").attributes()).toEqual({});
    });
  });

  describe("a behavior a setting switches on or off", () => {
    const hooks = { mounted: vi.fn(), unmounted: vi.fn() };

    beforeEach(() => {
      hooks.mounted.mockReset();
      hooks.unmounted.mockReset();
      registerCustomSectionBehavior("glow", {
        directive: () => Promise.resolve({ mounted: hooks.mounted, unmounted: hooks.unmounted }),
        description: "Glows.",
        value: { type: "string" },
      });
    });

    afterEach(() => {
      unregisterCustomSectionBehavior("glow");
    });

    it("starts when its setting is set, beside a behavior that stays", async () => {
      const wrapper = mountSection('<section><p data-inview data-glow="{{ settings.title }}">x</p></section>', {
        title: "",
      });
      await flushPromises();
      expect(hooks.mounted).not.toHaveBeenCalled();

      await wrapper.setProps({ model: { id: "section-1", type: TYPE, title: "gold" } });
      await vi.waitFor(() => expect(hooks.mounted).toHaveBeenCalledOnce());

      expect(wrapper.find("p").attributes()).toMatchObject({ "data-inview": "", "data-glow": "gold" });
    });

    it("stops when its setting is cleared", async () => {
      const wrapper = mountSection('<section><p data-glow="{{ settings.title }}">x</p></section>', { title: "gold" });
      await vi.waitFor(() => expect(hooks.mounted).toHaveBeenCalledOnce());

      await wrapper.setProps({ model: { id: "section-1", type: TYPE, title: "" } });

      expect(hooks.unmounted).toHaveBeenCalledOnce();
      expect(wrapper.find("p").attributes("data-glow")).toBeUndefined();
    });
  });
});
