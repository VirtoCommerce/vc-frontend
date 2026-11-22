import { describe, expect, it, vi } from "vitest";
import { sanitizeSectionHtml } from "../sections";
import { sanitizeRichText } from "./rich-text";

const SCOPE = { type: "custom-x", assetsBaseUrl: "https://cdn.example.com/assets" };

describe("sanitizeRichText", () => {
  it("keeps an attribute only on the elements that take it", () => {
    expect(sanitizeRichText('<p open poster="x">A</p><details open>B</details>', SCOPE).html).toBe(
      '<p>A</p><details open="">B</details>',
    );
  });

  it("counts the elements it keeps, and reads a value once per section type and asset library", () => {
    const html = "<p>A <b>B</b></p><script>x</script>";

    expect(sanitizeRichText(html, SCOPE).elements).toBe(2);
    expect(sanitizeRichText(html, SCOPE)).toBe(sanitizeRichText(html, SCOPE));
    expect(sanitizeRichText(html, { ...SCOPE, type: "custom-y" })).not.toBe(sanitizeRichText(html, SCOPE));
  });

  it("keeps the 64 values read last, a value read again counting as read last", () => {
    const first = sanitizeRichText("<p>First</p>", SCOPE);
    const second = sanitizeRichText("<p>Second</p>", SCOPE);

    for (let index = 0; index < 62; index++) {
      sanitizeRichText(`<p>Filler ${index}</p>`, SCOPE);
    }
    sanitizeRichText("<p>First</p>", SCOPE);
    sanitizeRichText("<p>One more</p>", SCOPE);

    expect(sanitizeRichText("<p>First</p>", SCOPE)).toBe(first);
    expect(sanitizeRichText("<p>Second</p>", SCOPE)).not.toBe(second);
  });

  it("finds a value it read before by the string itself, never by a key built from it", () => {
    const html = `<p data-note="${"x".repeat(1_000_000)}">Hi</p>`;
    sanitizeRichText(html, SCOPE);
    const startedAt = performance.now();

    for (let index = 0; index < 2000; index++) {
      sanitizeRichText(html, SCOPE);
    }

    expect(performance.now() - startedAt).toBeLessThan(500);
  });

  it("works in DOMPurify's inert document, so no image of it loads in the page", () => {
    const createElement = vi.spyOn(document, "createElement");

    sanitizeRichText('<img src="https://cdn.example.com/assets/a.png" alt="">', { ...SCOPE, type: "custom-z" });

    expect(createElement).not.toHaveBeenCalled();
    createElement.mockRestore();
  });

  it("leaves the built-in sections' rich text as it was", () => {
    const html = '<p style="color: red" class="fixed">A</p>';

    sanitizeRichText(html, SCOPE);

    expect(sanitizeSectionHtml(html)).toBe(html);
  });
});
