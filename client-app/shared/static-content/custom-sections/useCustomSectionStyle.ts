import { onBeforeUnmount, onMounted, watch } from "vue";
import { filterSectionCss } from "./css-filter";

interface IAppliedStyle {
  element: HTMLStyleElement;
  /** Mounted sections of the type. */
  users: number;
  css?: string;
}

export const CUSTOM_SECTION_STYLE_ATTRIBUTE = "data-sb-custom-section";

const appliedStyles = new Map<string, IAppliedStyle>();

/**
 * Puts a type's CSS in the page once, while any section of the type is mounted, so it reaches only them:
 * `@layer sections { @scope ([data-sb-type="{type}"]) { … } }`.
 */
export function useCustomSectionStyle(type: () => string, css: () => string | undefined): void {
  let usedType: string | undefined;

  function use(nextType: string): void {
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
    const source = css() ?? "";

    if (applied && applied.css !== source) {
      applied.css = source;
      applied.element.textContent = toScopedCss(usedType, source);
    }
  }

  onMounted(() => {
    use(type());
    write();
  });

  watch([type, css], ([nextType]) => {
    if (usedType === undefined) {
      return;
    }

    if (nextType !== usedType) {
      release();
      use(nextType);
    }

    write();
  });

  onBeforeUnmount(release);
}

function toScopedCss(type: string, css: string): string {
  const filtered = filterSectionCss(type, css);

  if (!filtered || (!filtered.rules && !filtered.keyframes)) {
    return "";
  }

  // Keyframes go beside the scope: `@scope` holds style rules only.
  return `@layer sections {\n${filtered.keyframes}\n@scope ([data-sb-type="${type}"]) {\n${filtered.rules}\n}\n}`;
}
