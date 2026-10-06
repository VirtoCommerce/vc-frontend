import { set } from "lodash-es";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { getItem, onItemChange } from "./registry";
import type { ArgSourceType, AttrFieldType, ObjectSourceType, RuleType } from "./types";
import type { AnalyticsEventMapType } from "@/core/types/analytics";

const NAME_ATTR = "data-name";
const ANY_NAME = `[${NAME_ATTR}]`;
const INTERACTIVE = "a, button";

function byName(name: string): string {
  return `[${NAME_ATTR}="${name}"]`;
}

function resolveScope(el: Element, from?: string): Element | null {
  return from ? el.closest(byName(from)) : el;
}

function readAttr(el: Element, { attr, type }: AttrFieldType): string | number | undefined {
  const raw = (el as HTMLElement).dataset[attr];
  if (raw === undefined || raw === "") {
    return undefined;
  }
  if (type !== "number") {
    return raw;
  }
  const num = Number(raw);
  return Number.isNaN(num) ? undefined : num;
}

function readObject(el: Element, fields: ObjectSourceType["fields"]): Record<string, unknown> | undefined {
  let result: Record<string, unknown> | undefined;
  Object.entries(fields).forEach(([path, field]) => {
    const value = readAttr(el, field);
    if (value !== undefined) {
      result = set(result ?? {}, path, value);
    }
  });
  return result;
}

function readItem(el: Element, fallback?: ObjectSourceType): unknown {
  return getItem(el) ?? (fallback ? readObject(el, fallback.fields) : undefined);
}

function resolveArg(el: Element, arg: ArgSourceType): unknown {
  const scope = resolveScope(el, arg.from);
  if (!scope) {
    return undefined;
  }
  switch (arg.source) {
    case "item":
      return readItem(scope, arg.fallback);
    case "attr":
      return readAttr(scope, arg);
    case "object":
      return readObject(scope, arg.fields);
    case "collect": {
      const items = Array.from(scope.querySelectorAll(byName(arg.target)))
        .map((child) => readItem(child, arg.fallback))
        .filter((item) => item !== undefined);
      return items.length ? items : undefined;
    }
  }
}

/** Returns `null` when a required argument is missing: the event is skipped */
function resolveArgs(el: Element, rule: RuleType): unknown[] | null {
  const args = rule.args.map((arg) => resolveArg(el, arg));
  const isComplete = rule.args.every((arg, i) => arg.optional || args[i] !== undefined);
  return isComplete ? args : null;
}

function entityId(value: unknown): unknown {
  return typeof value === "object" && value !== null && "id" in value ? value.id : undefined;
}

// A refetched entity is a new object with the same id: it must not fire `appear` again
function isSameValue(a: unknown, b: unknown): boolean {
  const id = entityId(a);
  return a === b || (id !== undefined && id === entityId(b));
}

function isShallowEqual(a: unknown, b: unknown): boolean {
  if (isSameValue(a, b)) {
    return true;
  }
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    return false;
  }
  const keysA = Object.keys(a);
  return (
    keysA.length === Object.keys(b).length &&
    keysA.every((key) => isSameValue((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
  );
}

function isSameArgs(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((arg, i) => isShallowEqual(arg, b[i]));
}

const scanners = new Set<() => void>();

/** Rescans the document in every running engine, e.g. after new `appear` rules were added */
export function rescan(): void {
  scanners.forEach((scan) => scan());
}

/**
 * Listens to the document and turns rule matches into `analytics(...)` calls.
 * `rules` is read on every click and scan, so rules pushed into it later take effect.
 * Returns a function that removes all listeners.
 */
export function startEngine(rules: RuleType[]): () => void {
  const { analytics } = useAnalytics();

  function send(rule: RuleType, args: unknown[]): void {
    analytics(rule.event, ...(args as AnalyticsEventMapType[typeof rule.event]));
  }

  function onClick(event: Event): void {
    // Only a click on a link or a button inside the role counts, not on its padding or empty space
    const interactive = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null;
    if (!interactive) {
      return;
    }
    let el = interactive.closest(ANY_NAME);
    while (el) {
      const name = el.getAttribute(NAME_ATTR);
      const matched = rules.filter((rule) => rule.trigger === "click" && rule.target === name);
      let isSent = false;
      for (const rule of matched) {
        const args = resolveArgs(el, rule);
        if (args) {
          send(rule, args);
          isSent = true;
        }
      }
      if (isSent) {
        return;
      }
      el = el.parentElement?.closest(ANY_NAME) ?? null;
    }
  }

  // An element fires again only when it gets different arguments: other entities or other list params
  const sentArgs = new WeakMap<Element, Map<RuleType, unknown[]>>();
  let isScanScheduled = false;
  let isStopped = false;

  function scan(): void {
    isScanScheduled = false;
    if (isStopped) {
      return;
    }
    rules.forEach((rule) => {
      if (rule.trigger !== "appear") {
        return;
      }
      document.querySelectorAll(byName(rule.target)).forEach((el) => {
        const args = resolveArgs(el, rule);
        if (!args) {
          return;
        }
        const byRule = sentArgs.get(el) ?? new Map<RuleType, unknown[]>();
        const previous = byRule.get(rule);
        if (previous && isSameArgs(previous, args)) {
          return;
        }
        byRule.set(rule, args);
        sentArgs.set(el, byRule);
        send(rule, args);
      });
    });
  }

  function scheduleScan(): void {
    if (!isScanScheduled) {
      isScanScheduled = true;
      queueMicrotask(scan);
    }
  }

  // Capture phase: a component calling stopPropagation() must not hide the click
  document.addEventListener("click", onClick, true);

  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.body, { childList: true, subtree: true });
  const stopItemListener = onItemChange(scheduleScan);
  scanners.add(scheduleScan);
  scheduleScan();

  return () => {
    isStopped = true;
    document.removeEventListener("click", onClick, true);
    observer.disconnect();
    stopItemListener();
    scanners.delete(scheduleScan);
  };
}
