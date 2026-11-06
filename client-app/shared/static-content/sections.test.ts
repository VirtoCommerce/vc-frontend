import { describe, expect, it } from "vitest";
import { defineAsyncComponent, defineComponent } from "vue";
import {
  getLoadedSectionComponent,
  getRegisteredSection,
  getSectionLinkAttr,
  loadSectionComponent,
  pickDeclaredProps,
  sanitizeSectionHtml,
  toHeadingTag,
} from "./sections";

const Section = defineComponent({
  props: { title: String, slides: Array, isTransparent: Boolean },
  template: "<div />",
});

describe("toHeadingTag", () => {
  it.each(["h1", "h2", "h3", "h4", "h5", "h6"])("keeps %s", (tag) => {
    expect(toHeadingTag(tag)).toBe(tag);
  });

  it("ignores the case of the tag", () => {
    expect(toHeadingTag("H3")).toBe("h3");
  });

  it.each(["script", "iframe", "a", "", undefined, 2])("falls back to h2 for %j", (value) => {
    expect(toHeadingTag(value)).toBe("h2");
  });
});

describe("sanitizeSectionHtml", () => {
  it("keeps formatting and safe links", () => {
    const html = '<p><b>Bold</b> <a href="https://example.com" class="link">link</a></p><ul><li>item</li></ul>';

    expect(sanitizeSectionHtml(html)).toBe(html);
  });

  it("removes scripts, event handlers, frames and javascript: links", () => {
    const html =
      '<script>alert(1)</script><img src="x.png" onerror="alert(1)"><iframe src="https://example.com"></iframe>' +
      '<a href="javascript:alert(1)">x</a>'; // nosemgrep: vc-javascript-uri -- sanitizer input fixture, never rendered

    expect(sanitizeSectionHtml(html)).toBe('<img src="x.png"><a>x</a>');
  });

  it("keeps target and adds rel to links that open a new window", () => {
    expect(sanitizeSectionHtml('<a href="https://example.com" target="_blank">x</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">x</a>',
    );
  });

  it.each(["promo", "_BLANK"])("adds rel to links with the %s target", (target) => {
    expect(sanitizeSectionHtml(`<a href="https://example.com" target="${target}">x</a>`)).toBe(
      `<a href="https://example.com" target="${target}" rel="noopener noreferrer">x</a>`,
    );
  });

  it("keeps the author's rel tokens", () => {
    expect(sanitizeSectionHtml('<a href="https://example.com" target="_blank" rel="nofollow noopener">x</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">x</a>',
    );
  });

  it.each(["_self", "_top"])("does not add rel to links with the %s target", (target) => {
    const html = `<a href="https://example.com" target="${target}">x</a>`;

    expect(sanitizeSectionHtml(html)).toBe(html);
  });

  it.each(["whatsapp://send?phone=1", "skype:user?call", "tg://resolve?domain=shop", "sms:+15550100", "/catalog"])(
    "keeps the link %s",
    (url) => {
      const html = `<a href="${url}">x</a>`;

      expect(sanitizeSectionHtml(html)).toBe(html);
    },
  );

  it.each(["javascript:alert(1)", "java\tscript:alert(1)", "VBScript:msgbox(1)", "data:text/html,<p>x</p>"])(
    "drops the link %j",
    (url) => {
      expect(sanitizeSectionHtml(`<a href="${url}">x</a>`)).toBe("<a>x</a>");
    },
  );

  it("keeps an inline data: image", () => {
    const html = '<img src="data:image/png;base64,iVBORw0KGgo=">';

    expect(sanitizeSectionHtml(html)).toBe(html);
  });

  it("returns an empty string for no content", () => {
    expect(sanitizeSectionHtml(undefined)).toBe("");
  });
});

describe("pickDeclaredProps", () => {
  it("keeps only the declared props", () => {
    const item = {
      id: "1",
      type: "slider",
      title: "Title",
      slides: [],
      onerror: "alert(1)",
      onClick: "alert(1)",
      style: "color: red",
      class: "x",
      href: "javascript:alert(1)",
    };

    expect(pickDeclaredProps(Section, item)).toEqual({ title: "Title", slides: [] });
  });

  it("matches kebab-case keys to camelCase props", () => {
    expect(pickDeclaredProps(Section, { "is-transparent": true })).toEqual({ isTransparent: true });
  });

  it("supports props declared as an array", () => {
    const ArraySection = defineComponent({ props: ["title"], template: "<div />" });

    expect(pickDeclaredProps(ArraySection, { title: "Title", src: "x" })).toEqual({ title: "Title" });
  });

  it("passes nothing to a component without props", () => {
    expect(pickDeclaredProps(defineComponent({ template: "<div />" }), { title: "Title" })).toEqual({});
  });
});

describe("getSectionLinkAttr", () => {
  it("links a relative and an app URL", () => {
    expect(getSectionLinkAttr("/catalog")).toEqual({ to: "/catalog" });
    expect(getSectionLinkAttr("whatsapp://send?phone=1")).toEqual({ externalLink: "whatsapp://send?phone=1" });
  });

  it.each(["javascript:alert(1)", "data:text/html,<p>x</p>", "https://a b.com", undefined])(
    "renders no link for %j",
    (link) => {
      expect(getSectionLinkAttr(link)).toEqual({});
    },
  );
});

describe("getRegisteredSection", () => {
  it("returns a registered section", () => {
    expect(getRegisteredSection({ slider: Section }, "slider")).toBe(Section);
  });

  it.each(["toString", "constructor", "__proto__", "unknown", undefined])("returns nothing for %j", (type) => {
    expect(getRegisteredSection({ slider: Section }, type)).toBeUndefined();
  });
});

describe("section components", () => {
  it("returns a regular component as loaded", () => {
    expect(getLoadedSectionComponent(Section)).toBe(Section);
  });

  it("loads the inner component of an async one", async () => {
    const LazySection = defineAsyncComponent(() => Promise.resolve(Section));

    expect(getLoadedSectionComponent(LazySection)).toBeUndefined();
    await expect(loadSectionComponent(LazySection)).resolves.toBe(Section);
    expect(getLoadedSectionComponent(LazySection)).toBe(Section);
  });
});
