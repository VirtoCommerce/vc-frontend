import { beforeAll, describe, expect, it } from "vitest";
import { toFieldMap } from "./bindings";
import { getCustomSectionKit, registerBuiltInKit } from "./kit";
import { MAX_RENDERED_TEMPLATE_TEXT, MAX_RENDERED_TEXT, RENDER_BUDGET } from "./limits";
import { fitsRenderLimits } from "./render-limits";
import { compileTemplate } from "./template";
import type { ICompiledTemplate } from "./template";
import type { IThemeSchemaField } from "@/core/theme-snapshot";

const FIELDS: IThemeSchemaField[] = [
  { id: "title", type: "string" },
  { id: "body", type: "text" },
  { id: "rows", type: "list", element: [] },
];

function fits(template: string, settings: Record<string, unknown>): boolean {
  const compiled = compileTemplate(template, getCustomSectionKit()) as ICompiledTemplate;

  return fitsRenderLimits(compiled.root, { type: "custom-x", settings, fields: toFieldMap(FIELDS) }, new Map());
}

function rows(count: number): Record<string, unknown>[] {
  return Array.from({ length: count }, () => ({}));
}

describe("fitsRenderLimits", () => {
  beforeAll(() => {
    registerBuiltInKit();
  });

  it("takes bound text up to the cap", () => {
    const template = "<section><p>{{ settings.title }}</p></section>";

    expect(fits(template, { title: "a".repeat(MAX_RENDERED_TEXT) })).toBe(true);
    expect(fits(template, { title: "a".repeat(MAX_RENDERED_TEXT + 1) })).toBe(false);
  });

  it("counts a value bound in an attribute as text", () => {
    const template = '<section><p title="{{ settings.title }}">x</p></section>';

    expect(fits(template, { title: "a".repeat(MAX_RENDERED_TEXT) })).toBe(true);
    expect(fits(template, { title: "a".repeat(MAX_RENDERED_TEXT + 1) })).toBe(false);
  });

  it("counts rich text by its sanitized HTML", () => {
    const template = '<section><div data-html="settings.body"></div></section>';
    const fill = MAX_RENDERED_TEXT - "<p></p>".length;

    expect(fits(template, { body: `<p>${"a".repeat(fill)}</p>` })).toBe(true);
    expect(fits(template, { body: `<p>${"a".repeat(fill + 1)}</p>` })).toBe(false);
  });

  it("counts the text a repeating behavior's element holds twice", () => {
    const template = "<section><p data-marquee>{{ settings.title }}</p></section>";
    const half = MAX_RENDERED_TEXT / 2;

    expect(fits(template, { title: "a".repeat(half) })).toBe(true);
    expect(fits(template, { title: "a".repeat(half + 1) })).toBe(false);
  });

  it("caps the template's own text, in text and attributes, once per row", () => {
    const text = "a".repeat(1024);
    const template = `<section><i data-each="settings.rows" title="${text}">${text}</i></section>`;
    const fitting = MAX_RENDERED_TEMPLATE_TEXT / (2 * text.length);

    expect(fits(template, { rows: rows(fitting) })).toBe(true);
    expect(fits(template, { rows: rows(fitting + 1) })).toBe(false);
  });

  it("takes elements up to the budget", () => {
    const template = '<section><i data-each="settings.rows"></i></section>';

    expect(fits(template, { rows: rows(RENDER_BUDGET - 1) })).toBe(true);
    expect(fits(template, { rows: rows(RENDER_BUDGET) })).toBe(false);
  });

  it("counts the span each text of a repeating behavior's element renders in, in the run and the copy", () => {
    // The section, the strip, its behavior, then the span of its text and its `b`, each in the run and in the copy.
    const template =
      '<section><p data-marquee> {{ settings.title }} <b> </b></p><i data-each="settings.rows"></i></section>';
    const own = 1 + 1 + 1 + 2 + 2;

    expect(fits(template, { title: "Sale", rows: rows(RENDER_BUDGET - own) })).toBe(true);
    expect(fits(template, { title: "Sale", rows: rows(RENDER_BUDGET - own + 1) })).toBe(false);
  });
});
