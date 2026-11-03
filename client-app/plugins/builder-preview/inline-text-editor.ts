import { FIELD_ATTRIBUTE, SECTION_ATTRIBUTE } from "./section-overlay";

/** A plain-text setting of a section or block: the item, the setting's path in it and the text it shows. */
export interface IEditableText {
  itemId: string;
  path: (string | number)[];
  value: string;
}

/** Item keys that never hold a text the page shows. */
const NOT_TEXT = new Set(["id", "type", "hidden", "blocks", "componentRef"]);
/** Markup, markdown or a link: shown differently from how it is stored, so it is edited in the designer's panel. */
const NOT_PLAIN = /[<>*_#`[\]]|^\s*(https?:|\/|#)/;
const OUTLINE = "2px solid #2563eb";

function normalize(text: string): string {
  return text.replaceAll(/\s+/g, " ").trim();
}

/** The plain-text settings of a section and of its blocks, nested ones (objects, lists) too. */
export function findEditableTexts(item: Record<string, unknown>): IEditableText[] {
  const found: IEditableText[] = [];

  function walk(itemId: string, value: unknown, path: (string | number)[]): void {
    if (typeof value === "string") {
      if (normalize(value) && !NOT_PLAIN.test(value)) {
        found.push({ itemId, path, value });
      }
    } else if (Array.isArray(value)) {
      value.forEach((child, index) => walk(itemId, child, [...path, index]));
    } else if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([key, child]) => walk(itemId, child, [...path, key]));
    }
  }

  function walkItem(value: Record<string, unknown>): void {
    if (typeof value.id !== "string" || value.hidden) {
      return;
    }

    Object.entries(value)
      .filter(([key]) => !NOT_TEXT.has(key))
      .forEach(([key, child]) => walk(value.id as string, child, [key]));
  }

  walkItem(item);
  (Array.isArray(item.blocks) ? item.blocks : []).forEach((block) => walkItem(block as Record<string, unknown>));

  return found;
}

/**
 * The element a click edits and the setting it shows: the innermost `data-pb-field` element inside the section, else
 * the innermost element whose text exactly one plain-text setting of the section has.
 */
export function findEditableElement(
  start: Element | null,
  texts: IEditableText[],
): { element: HTMLElement; text: IEditableText } | null {
  for (let element = start; element && !element.hasAttribute(SECTION_ATTRIBUTE); element = element.parentElement) {
    if (!(element instanceof HTMLElement)) {
      continue;
    }

    const field = element.getAttribute(FIELD_ATTRIBUTE);
    const shown = normalize(element.textContent ?? "");
    const matches = field
      ? texts.filter((text) => text.path.join(".") === field)
      : texts.filter((text) => shown && normalize(text.value) === shown);

    if (matches.length === 1) {
      return { element, text: matches[0] };
    }
  }

  return null;
}

/**
 * Edits a section's text right on the page: a click on a text the section has as a plain setting makes that element
 * editable, and every change goes to the designer as the setting's new value. A press outside, Enter (single line)
 * or Esc ends editing.
 */
export class InlineTextEditor {
  private editing: { element: HTMLElement; text: IEditableText } | null = null;

  constructor(
    private readonly blocker: HTMLElement,
    private readonly onEdit: (edit: IEditableText) => void,
    /** Editing ended: the preview applies the render it held back. */
    private readonly onEnd: () => void,
  ) {}

  get isEditing(): boolean {
    return this.editing !== null;
  }

  /** Starts editing the text under the pointer when it is one of the section's settings. */
  start(texts: IEditableText[], clientX: number, clientY: number): boolean {
    this.end();

    const under = document.elementsFromPoint(clientX, clientY).find((element) => element !== this.blocker);
    const found = findEditableElement(under ?? null, texts);

    if (!found) {
      return false;
    }

    const { element } = found;
    this.editing = found;
    element.setAttribute("contenteditable", "plaintext-only");
    if (element.contentEditable !== "plaintext-only") {
      element.setAttribute("contenteditable", "true");
    }
    element.style.outline = OUTLINE;
    this.blocker.style.pointerEvents = "none";
    element.focus({ preventScroll: true });
    element.addEventListener("input", this.handleInput);
    element.addEventListener("keydown", this.handleKeydown);
    document.addEventListener("mousedown", this.handleOutsidePress, true);

    return true;
  }

  end(): void {
    if (!this.editing) {
      return;
    }

    const { element } = this.editing;
    this.editing = null;
    element.removeEventListener("input", this.handleInput);
    element.removeEventListener("keydown", this.handleKeydown);
    document.removeEventListener("mousedown", this.handleOutsidePress, true);
    element.removeAttribute("contenteditable");
    element.style.outline = "";
    element.blur();
    this.blocker.style.pointerEvents = "auto";
    this.onEnd();
  }

  private readonly handleInput = (): void => {
    if (!this.editing) {
      return;
    }

    const { element, text } = this.editing;
    // The editor writes a no-break space for a trailing space; the setting holds a plain one.
    const value = (element.innerText || element.textContent || "").replaceAll(" ", " ");
    this.onEdit({ ...text, value: text.value.includes("\n") ? value : value.replaceAll("\n", " ") });
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const isMultiline = this.editing?.text.value.includes("\n");

    if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey && !isMultiline)) {
      event.preventDefault();
      this.end();
    }
  };

  private readonly handleOutsidePress = (event: MouseEvent): void => {
    if (this.editing && !this.editing.element.contains(event.target as Node)) {
      event.preventDefault();
      this.end();
    }
  };
}
