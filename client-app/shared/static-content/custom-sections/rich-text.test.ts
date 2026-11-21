import { describe, expect, it } from "vitest";
import { sanitizeSectionHtml } from "../sections";
import { sanitizeRichText } from "./rich-text";

const SCOPE = { type: "custom-x", assetsBaseUrl: "https://cdn.example.com/assets" };

describe("sanitizeRichText", () => {
  it("keeps an attribute only on the elements that take it", () => {
    expect(sanitizeRichText('<p open poster="x">A</p><details open>B</details>', SCOPE)).toBe(
      '<p>A</p><details open="">B</details>',
    );
  });

  it("leaves the built-in sections' rich text as it was", () => {
    const html = '<p style="color: red" class="fixed">A</p>';

    sanitizeRichText(html, SCOPE);

    expect(sanitizeSectionHtml(html)).toBe(html);
  });
});
