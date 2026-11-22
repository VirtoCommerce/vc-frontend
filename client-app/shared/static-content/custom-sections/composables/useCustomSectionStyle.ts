import { onBeforeUnmount, onMounted, toValue, watch } from "vue";
import { SECTION_TYPE_ATTRIBUTE } from "../behaviors/constants";
import { filterSectionCss } from "../css-filter";
import type { MaybeRefOrGetter } from "vue";

interface IAppliedStyle {
  element: HTMLStyleElement;
  /** Mounted sections of the type. */
  users: number;
  sourceKey?: string;
}

export const CUSTOM_SECTION_STYLE_ATTRIBUTE = "data-sb-custom-section";

const appliedStyles = new Map<string, IAppliedStyle>();

/**
 * Puts a type's CSS in the page once, while any section of the type is mounted, so it reaches only them:
 * `@layer custom-sections { @scope ([data-sb-type="{type}"]) { … } }`.
 */
export function useCustomSectionStyle(
  type: MaybeRefOrGetter<string>,
  css: MaybeRefOrGetter<string | undefined>,
  assetsBaseUrl?: MaybeRefOrGetter<string | undefined>,
): void {
  let usedType: string | undefined;

  function acquire(nextType: string): void {
    let applied = appliedStyles.get(nextType);

    if (!applied) {
      const element = document.createElement("style");
      element.setAttribute(CUSTOM_SECTION_STYLE_ATTRIBUTE, nextType);
      document.head.appendChild(element);
      applied = { element, users: 0 };
      appliedStyles.set(nextType, applied);
    }

    applied.users++;
    usedType = nextType;
  }

  function release(): void {
    if (usedType === undefined) {
      return;
    }

    const applied = appliedStyles.get(usedType);

    if (applied && --applied.users === 0) {
      applied.element.remove();
      appliedStyles.delete(usedType);
    }

    usedType = undefined;
  }

  function write(): void {
    if (usedType === undefined) {
      return;
    }

    const applied = appliedStyles.get(usedType);
    const source = toValue(css) ?? "";
    const base = toValue(assetsBaseUrl);
    const sourceKey = `${base ?? ""}\n${source}`;

    if (applied && applied.sourceKey !== sourceKey) {
      applied.sourceKey = sourceKey;
      applied.element.textContent = toScopedCss(usedType, source, base);
    }
  }

  onMounted(() => {
    acquire(toValue(type));
    write();
  });

  watch([() => toValue(type), () => toValue(css), () => toValue(assetsBaseUrl)], ([nextType]) => {
    if (usedType === undefined) {
      return;
    }

    if (nextType !== usedType) {
      release();
      acquire(nextType);
    }

    write();
  });

  onBeforeUnmount(release);
}

function toScopedCss(type: string, css: string, assetsBaseUrl: string | undefined): string {
  const filtered = filterSectionCss(type, css, assetsBaseUrl);

  if (!filtered || (!filtered.rules && !filtered.keyframes)) {
    return "";
  }

  // A keyframes name is not scoped, so a type's keyframes are emitted once beside the scope, as the contract does.
  return `@layer custom-sections {\n${filtered.keyframes}\n@scope ([${SECTION_TYPE_ATTRIBUTE}="${type}"]) {\n${filtered.rules}\n}\n}`;
}
