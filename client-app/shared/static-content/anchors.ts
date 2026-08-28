import { nextTick } from "vue";
import { safeDecode } from "@/core/utilities/common";

const ANCHOR_WAIT_MS = 3000;

const TAKE_OVER_EVENTS = ["wheel", "touchmove"] as const;

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

let latestRequest = 0;

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

export function getAnchorId(item: Record<string, unknown>): string | undefined {
  const authored = typeof item.anchor === "string" && item.anchor.trim() ? slugifyAnchor(item.anchor) : "";
  return authored || (typeof item.id === "string" ? item.id : undefined);
}

export async function scrollToAnchor(hash: string, timeoutMs = ANCHOR_WAIT_MS): Promise<boolean> {
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

  if (!visitorHoldsFocus()) {
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }
    target.focus({ preventScroll: true });
  }

  return true;
}

export function cancelAnchorScroll(): void {
  latestRequest++;
}

function visitorHoldsFocus(): boolean {
  const active = document.activeElement;

  if (!(active instanceof HTMLElement) || active === document.body) {
    return false;
  }

  return active.tabIndex >= 0;
}

function findAnchor(id: string): HTMLElement | null {
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
      if (!isCurrent() || tookOver) {
        done(null);
        return;
      }

      const target = findAnchor(id);
      if (target) {
        done(target);
        return;
      }

      if (performance.now() >= deadline) {
        done(null);
        return;
      }

      requestAnimationFrame(poll);
    };

    requestAnimationFrame(poll);
  });
}
