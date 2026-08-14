import { nextTick } from "vue";
import { safeDecode } from "@/core/utilities/common";

/**
 * How long to keep looking for the anchor. Sections such as `slider`, `products`,
 * `products-carousel` and `category` are async components, so their roots appear well after the
 * page itself mounts.
 */
const ANCHOR_WAIT_MS = 3000;

/** Manual scrolling beyond this many pixels means the visitor took over — stop chasing the anchor. */
const TOOK_OVER_PX = 100;

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
 * the hash by the time the anchor exists in the DOM — the initial load has to scroll explicitly. Some
 * sections are async components on top of that, so the target is awaited rather than looked up once.
 *
 * @returns whether the anchor was found and scrolled to.
 */
export async function scrollToAnchor(hash: string, timeoutMs = ANCHOR_WAIT_MS): Promise<boolean> {
  if (!hash) {
    return false;
  }

  const id = safeDecode(hash.replace(/^#/, ""));
  if (!id) {
    return false;
  }

  await nextTick();

  const target = await waitForAnchor(id, timeoutMs);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });

  return !!target;
}

function findAnchor(id: string): HTMLElement | null {
  // `<a name="...">` anchors authored inside rich text are not reachable through getElementById.
  // getElementsByName takes the raw value, so no selector escaping is needed for it.
  return document.getElementById(id) ?? document.getElementsByName(id)[0] ?? null;
}

function waitForAnchor(id: string, timeoutMs: number): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const deadline = performance.now() + timeoutMs;
    const scrollAtStart = window.scrollY;

    const poll = () => {
      const target = findAnchor(id);
      if (target) {
        resolve(target);
        return;
      }

      // Give up once the budget is spent, or as soon as the visitor scrolls themselves — jumping the
      // page seconds after it settled is worse than not jumping at all.
      const tookOver = Math.abs(window.scrollY - scrollAtStart) > TOOK_OVER_PX;
      if (tookOver || performance.now() >= deadline) {
        resolve(null);
        return;
      }

      requestAnimationFrame(poll);
    };

    requestAnimationFrame(poll);
  });
}
