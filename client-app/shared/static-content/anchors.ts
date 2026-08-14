import { nextTick } from "vue";
import { safeDecode } from "@/core/utilities/common";

/**
 * How long to keep looking for the anchor. Sections such as `slider`, `products`,
 * `products-carousel` and `category` are async components, so their roots appear well after the
 * page itself mounts.
 */
const ANCHOR_WAIT_MS = 3000;

/**
 * Input that means the visitor took over and no longer wants to be moved. Scroll position cannot be
 * used for this: the router resets it to the top on every path change, which would read as the
 * visitor scrolling.
 */
const TAKE_OVER_EVENTS = ["wheel", "touchmove"] as const;

/**
 * Keys that scroll the page. Any other key — Tab, shortcuts, plain typing — must not cancel the
 * pending scroll, or a deep link would fail for anyone navigating by keyboard.
 */
const TAKE_OVER_KEYS = new Set([
  " ",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "End",
  "Home",
  "PageDown",
  "PageUp",
]);

/**
 * Only the most recent request may scroll: a navigation made while an earlier wait is still polling
 * would otherwise be overridden the moment that older target shows up.
 */
let latestRequest = 0;

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
  // Claim the request before anything can return early. The page watchers call this on every path
  // change, so a navigation without a hash has to invalidate a poll that is still running — else it
  // could scroll a page it no longer belongs to.
  const request = ++latestRequest;

  if (!hash) {
    return false;
  }

  const id = safeDecode(hash.replace(/^#/, ""));
  if (!id) {
    return false;
  }

  await nextTick();

  const target = await waitForAnchor(id, timeoutMs, () => request === latestRequest);
  if (!target || request !== latestRequest) {
    return false;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });

  return true;
}

function findAnchor(id: string): HTMLElement | null {
  // `<a name="...">` anchors authored inside rich text are not reachable through getElementById.
  // getElementsByName takes the raw value, so it needs no selector escaping, but it also matches
  // `<meta name>` and form controls — and every page carries meta names such as `description`.
  const named = Array.from(document.getElementsByName(id)).find((element) => element instanceof HTMLAnchorElement);

  return document.getElementById(id) ?? named ?? null;
}

function waitForAnchor(id: string, timeoutMs: number, isCurrent: () => boolean): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const deadline = performance.now() + timeoutMs;
    let tookOver = false;
    const takeOver = () => (tookOver = true);
    const takeOverOnKey = (event: KeyboardEvent) => {
      if (TAKE_OVER_KEYS.has(event.key)) {
        tookOver = true;
      }
    };

    TAKE_OVER_EVENTS.forEach((name) => window.addEventListener(name, takeOver, { passive: true }));
    window.addEventListener("keydown", takeOverOnKey, { passive: true });

    const done = (target: HTMLElement | null) => {
      TAKE_OVER_EVENTS.forEach((name) => window.removeEventListener(name, takeOver));
      window.removeEventListener("keydown", takeOverOnKey);
      resolve(target);
    };

    const poll = () => {
      const target = findAnchor(id);
      if (target) {
        done(target);
        return;
      }

      // Give up once a newer navigation replaced this one, the budget is spent, or the visitor takes
      // over — jumping the page seconds after it settled is worse than not jumping at all.
      if (!isCurrent() || tookOver || performance.now() >= deadline) {
        done(null);
        return;
      }

      requestAnimationFrame(poll);
    };

    requestAnimationFrame(poll);
  });
}
