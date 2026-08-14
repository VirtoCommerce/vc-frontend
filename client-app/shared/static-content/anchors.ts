import { nextTick } from "vue";

/**
 * Normalizes an authored anchor into something usable in a `#hash` link.
 *
 * Must stay in sync with `generateAnchor` in the Page Builder designer
 * (vc-module-pagebuilder, `integration/helpers/utils.ts`): the designer offers these values in the
 * rich text link dialog while this side renders the matching element id, so a mismatch would produce
 * links that resolve to nothing — see VCST-5704.
 */
export function slugifyAnchor(value: string): string {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * The element id a section or block is rendered with: the anchor a content manager authored, or the
 * generated section id, which is always present and is what the designer offers as a fallback.
 */
export function getAnchorId(item: Record<string, unknown>): string | undefined {
  const authored = typeof item.anchor === "string" && item.anchor.trim() ? slugifyAnchor(item.anchor) : "";
  return authored || (typeof item.id === "string" ? item.id : undefined);
}

/**
 * Scrolls to the element a `#hash` points at.
 *
 * Page Builder content is rendered after the route resolves, so the browser has already given up on
 * the hash by the time the anchor exists in the DOM — the initial load has to scroll explicitly.
 * Section wrappers render synchronously with the page, so waiting for the next frame is enough; the
 * data inside a section may still be loading and shift the target slightly.
 */
export async function scrollToAnchor(hash: string): Promise<boolean> {
  if (!hash) {
    return false;
  }

  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) {
    return false;
  }

  await nextTick();

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      // `<a name="...">` anchors authored inside rich text are not reachable through getElementById.
      const target = document.getElementById(id) ?? document.querySelector(`a[name="${CSS.escape(id)}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      resolve(!!target);
    });
  });
}
