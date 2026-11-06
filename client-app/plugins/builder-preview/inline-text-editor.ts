import { OUTLINE_COLOR } from "./section-overlay";
import { FIELD_ATTRIBUTE, SECTION_ATTRIBUTE } from "./utils";

/** A plain-text setting of a section or block: the item, the setting's path in it and the text it shows. */
export interface IEditableText {
  itemId: string;
  path: (string | number)[];
  value: string;
}

/** Item keys that never hold a text the page shows. */
const NOT_TEXT = new Set(["id", "type", "hidden", "blocks", "componentRef"]);
/**
 * Without a schema, a text that looks like markup, markdown or a link: shown differently from how it is stored, so it
 * is edited in the designer's panel.
 */
const NOT_PLAIN = /[<>*_#`[\]]|^\s*(https?:|\/|#)/;
/** A plain-text setting that is an address as a whole: a link's target, not a text the page shows. */
const ADDRESS = /^\s*(https?:\/\/|\/)\S*\s*$/;
const OUTLINE = `2px solid ${OUTLINE_COLOR}`;

function normalize(text: string): string {
  return text.replaceAll(/\s+/g, " ").trim();
}

/** Whether a setting of an item of the type is plain text by its schema; `undefined` when there is no schema. */
export type PlainTextFieldPredicateType = (itemType: string, path: (string | number)[]) => boolean | undefined;

/** The plain-text settings of a section and of its blocks, nested ones (objects, lists) too. */
export function findEditableTexts(
  item: Record<string, unknown>,
  isPlainTextField: PlainTextFieldPredicateType = () => undefined,
): IEditableText[] {
  const found: IEditableText[] = [];

  function walk(owner: { id: string; type: string }, value: unknown, path: (string | number)[]): void {
    if (typeof value === "string") {
      if (isEditableText(value, isPlainTextField(owner.type, path))) {
        found.push({ itemId: owner.id, path, value });
      }
    } else if (Array.isArray(value)) {
      value.forEach((child, index) => walk(owner, child, [...path, index]));
    } else if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([key, child]) => walk(owner, child, [...path, key]));
    }
  }

  function walkItem(value: Record<string, unknown>): void {
    if (typeof value.id !== "string" || value.hidden) {
      return;
    }

    const owner = { id: value.id, type: typeof value.type === "string" ? value.type : "" };

    Object.entries(value)
      .filter(([key]) => !NOT_TEXT.has(key))
      .forEach(([key, child]) => walk(owner, child, [key]));
  }

  walkItem(item);
  (Array.isArray(item.blocks) ? item.blocks : []).forEach((block) => walkItem(block as Record<string, unknown>));

  return found;
}

function isEditableText(value: string, isPlainText: boolean | undefined): boolean {
  if (!normalize(value) || isPlainText === false) {
    return false;
  }

  return isPlainText ? !ADDRESS.test(value) : !NOT_PLAIN.test(value);
}

/**
 * The element a click edits and the setting it shows. Inside a `data-pb-field` element it is that setting of the
 * section or block the element is in, edited in the innermost element that shows its text as is, else in the marked
 * element. Elsewhere it is the innermost element whose text exactly one setting has, of those no element names.
 */
export function findEditableElement(
  start: Element | null,
  texts: IEditableText[],
): { element: HTMLElement; text: IEditableText } | null {
  if (!start) {
    return null;
  }

  const ownerId = getOwnerId(start);
  const fieldElement = start.closest(`[${FIELD_ATTRIBUTE}]`);
  const named =
    fieldElement instanceof HTMLElement && getOwnerId(fieldElement) === ownerId
      ? texts.filter((text) => isText(text, ownerId, fieldElement.getAttribute(FIELD_ATTRIBUTE)))
      : [];

  if (named.length === 1 && fieldElement instanceof HTMLElement) {
    const element = findElementShowing(start, fieldElement, named[0].value) ?? fieldElement;
    return { element, text: named[0] };
  }

  const namedKeys = new Set(
    [...start.ownerDocument.querySelectorAll(`[${FIELD_ATTRIBUTE}]`)].map((element) =>
      toFieldKey(getOwnerId(element), element.getAttribute(FIELD_ATTRIBUTE)),
    ),
  );
  const unnamed = texts.filter((text) => !namedKeys.has(toFieldKey(text.itemId, text.path.join("."))));

  for (
    let element: Element | null = start;
    element && !element.hasAttribute(SECTION_ATTRIBUTE);
    element = element.parentElement
  ) {
    const shown = normalize(element.textContent ?? "");
    const matches = unnamed.filter((text) => shown && normalize(text.value) === shown);

    if (element instanceof HTMLElement && matches.length === 1) {
      return { element, text: matches[0] };
    }
  }

  return null;
}

/** The id of the section or block an element is in. */
function getOwnerId(element: Element): string | null {
  return element.closest(`[${SECTION_ATTRIBUTE}]`)?.getAttribute(SECTION_ATTRIBUTE) ?? null;
}

function isText(text: IEditableText, itemId: string | null, path: string | null): boolean {
  return text.itemId === itemId && text.path.join(".") === path;
}

function toFieldKey(itemId: string | null, path: string | null): string {
  return `${itemId ?? ""}|${path ?? ""}`;
}

/** The innermost element from `start` up to `last` whose text is the value as is. */
function findElementShowing(start: Element, last: HTMLElement, value: string): HTMLElement | undefined {
  for (let element: Element | null = start; element && element !== last; element = element.parentElement) {
    if (element instanceof HTMLElement && normalize(element.textContent ?? "") === normalize(value)) {
      return element;
    }
  }

  return normalize(last.textContent ?? "") === normalize(value) ? last : undefined;
}

/**
 * Edits a section's text right on the page: a click on a text the section has as a plain setting makes that element
 * editable, and every change goes to the designer as the setting's new value. A press outside, Enter (single line)
 * or Esc ends editing.
 */
export class InlineTextEditor {
  private editing: {
    element: HTMLElement;
    text: IEditableText;
    textTransform: string;
    /** The nodes the page rendered the text into: the page updates the text through them later. */
    nodes: ChildNode[];
  } | null = null;

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
    this.editing = { ...found, textTransform: element.style.textTransform, nodes: [...element.childNodes] };
    element.setAttribute("contenteditable", "plaintext-only");
    if (element.contentEditable !== "plaintext-only") {
      element.setAttribute("contenteditable", "true");
    }
    element.style.outline = OUTLINE;
    // The text as stored: `innerText` applies `text-transform`, so an uppercase heading would be saved uppercased.
    element.style.textTransform = "none";
    this.blocker.style.pointerEvents = "none";
    element.focus({ preventScroll: true });
    placeCaret(clientX, clientY);
    element.addEventListener("input", this.handleInput);
    element.addEventListener("keydown", this.handleKeydown);
    element.addEventListener("blur", this.handleBlur);
    document.addEventListener("mousedown", this.handleOutsidePress, true);
    document.addEventListener("click", this.handleClickInside, true);

    return true;
  }

  end(): void {
    if (!this.editing) {
      return;
    }

    const { element, textTransform, nodes } = this.editing;
    this.editing = null;
    element.removeEventListener("input", this.handleInput);
    element.removeEventListener("keydown", this.handleKeydown);
    element.removeEventListener("blur", this.handleBlur);
    document.removeEventListener("mousedown", this.handleOutsidePress, true);
    document.removeEventListener("click", this.handleClickInside, true);
    element.removeAttribute("contenteditable");
    element.style.outline = "";
    element.style.textTransform = textTransform;
    restoreNodes(element, nodes);
    element.blur();
    this.blocker.style.pointerEvents = "auto";
    this.onEnd();
  }

  private readonly handleInput = (): void => {
    if (!this.editing) {
      return;
    }

    const { element, text } = this.editing;
    // The editor writes a no-break space for a trailing space; the setting holds a plain one. An emptied element keeps
    // only the browser's line break placeholder, which is no text.
    const value = element.textContent ? (element.innerText || element.textContent).replaceAll(" ", " ") : "";
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

  /** Focus leaving the text, as a click in the designer's panel does, ends editing like a press outside. */
  private readonly handleBlur = (): void => {
    this.end();
  };

  /** A click inside the text only places the caret: a link or button around it does not act. */
  private readonly handleClickInside = (event: MouseEvent): void => {
    if (this.editing?.element.contains(event.target as Node)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
}

/**
 * Puts back the nodes the page rendered the text into when editing replaced them, as deleting the whole text does:
 * the page would otherwise update nodes that are no longer shown. A single text node keeps the text as typed.
 */
function restoreNodes(element: HTMLElement, nodes: ChildNode[]): void {
  const current = element.childNodes;
  const isReplaced = nodes.length !== current.length || nodes.some((node, index) => current[index] !== node);

  if (!isReplaced) {
    return;
  }

  if (nodes.length === 1 && nodes[0].nodeType === Node.TEXT_NODE) {
    nodes[0].nodeValue = element.textContent;
  }

  element.replaceChildren(...nodes);
}

/** Puts the caret where the pointer is; without browser support it stays where focus put it. */
function placeCaret(clientX: number, clientY: number): void {
  const position =
    typeof document.caretPositionFromPoint === "function" ? document.caretPositionFromPoint(clientX, clientY) : null;
  const selection = globalThis.getSelection();

  if (position && selection) {
    const range = document.createRange();
    range.setStart(position.offsetNode, position.offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
