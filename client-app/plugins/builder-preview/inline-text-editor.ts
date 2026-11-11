import { OUTLINE_COLOR } from "./section-overlay";
import { FIELD_ATTRIBUTE, SECTION_ATTRIBUTE } from "./utils";

export interface IEditableText {
  itemId: string;
  path: (string | number)[];
  value: string;
  /** Whether the setting's schema lets it hold line breaks. */
  multiline?: boolean;
}

const NOT_TEXT = new Set(["id", "type", "hidden", "blocks", "componentRef"]);
/** A plain-text setting that is an address as a whole: a link's target, not a text the page shows. */
const ADDRESS = /^\s*(https?:\/\/|\/)\S*\s*$/;
const OUTLINE = `2px solid ${OUTLINE_COLOR}`;

function normalize(text: string): string {
  return text.replaceAll(/\s+/g, " ").trim();
}

type FieldPredicateType = (itemType: string, path: (string | number)[]) => boolean;

export function findEditableTexts(
  item: Record<string, unknown>,
  isPlainTextField: FieldPredicateType,
  isMultilineField: FieldPredicateType,
): IEditableText[] {
  const found: IEditableText[] = [];

  function walk(owner: { id: string; type: string }, value: unknown, path: (string | number)[]): void {
    if (typeof value === "string") {
      if (isEditableText(value, isPlainTextField(owner.type, path))) {
        found.push({ itemId: owner.id, path, value, multiline: isMultilineField(owner.type, path) });
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

function isEditableText(value: string, isPlainText: boolean): boolean {
  return isPlainText && !!normalize(value) && !ADDRESS.test(value);
}

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

function getOwnerId(element: Element): string | null {
  return element.closest(`[${SECTION_ATTRIBUTE}]`)?.getAttribute(SECTION_ATTRIBUTE) ?? null;
}

function isText(text: IEditableText, itemId: string | null, path: string | null): boolean {
  return text.itemId === itemId && text.path.join(".") === path;
}

function toFieldKey(itemId: string | null, path: string | null): string {
  return `${itemId ?? ""}|${path ?? ""}`;
}

function findElementShowing(start: Element, last: HTMLElement, value: string): HTMLElement | undefined {
  for (let element: Element | null = start; element && element !== last; element = element.parentElement) {
    if (element instanceof HTMLElement && normalize(element.textContent ?? "") === normalize(value)) {
      return element;
    }
  }

  return normalize(last.textContent ?? "") === normalize(value) ? last : undefined;
}

export interface IEndedEdit {
  text: IEditableText;
  /** Gives the element back the text it showed when the edit started. */
  revert: () => void;
}

export class InlineTextEditor {
  private editing: {
    element: HTMLElement;
    text: IEditableText;
    textTransform: string;
    nodes: ChildNode[];
    values: (string | null)[];
  } | null = null;

  constructor(
    private readonly blocker: HTMLElement,
    private readonly onEdit: (edit: IEditableText) => void,
    private readonly onEnd: (ended: IEndedEdit) => void,
  ) {}

  get isEditing(): boolean {
    return this.editing !== null;
  }

  start(texts: IEditableText[], clientX: number, clientY: number): boolean {
    this.end();

    const under = document.elementsFromPoint(clientX, clientY).find((element) => element !== this.blocker);
    const found = findEditableElement(under ?? null, texts);

    if (!found) {
      return false;
    }

    const { element } = found;
    const nodes = [...element.childNodes];
    this.editing = {
      ...found,
      textTransform: element.style.textTransform,
      nodes,
      values: nodes.map((node) => node.nodeValue),
    };
    element.setAttribute("contenteditable", "plaintext-only");
    if (element.contentEditable !== "plaintext-only") {
      element.setAttribute("contenteditable", "true");
    }
    element.style.outline = OUTLINE;
    // `innerText` applies `text-transform`, so an uppercase heading would otherwise be saved uppercased.
    element.style.textTransform = "none";
    this.blocker.style.pointerEvents = "none";
    element.focus({ preventScroll: true });
    placeCaret(clientX, clientY);
    element.addEventListener("input", this.handleInput);
    element.addEventListener("keydown", this.handleKeydown);
    element.addEventListener("blur", this.handleBlur);
    document.addEventListener("mousedown", this.handleOutsidePress, true);
    document.addEventListener("click", this.handleClickInside, true);
    document.addEventListener("auxclick", this.handleClickInside, true);

    return true;
  }

  end(): void {
    if (!this.editing) {
      return;
    }

    const { element, text, textTransform, nodes, values } = this.editing;
    this.editing = null;
    element.removeEventListener("input", this.handleInput);
    element.removeEventListener("keydown", this.handleKeydown);
    element.removeEventListener("blur", this.handleBlur);
    document.removeEventListener("mousedown", this.handleOutsidePress, true);
    document.removeEventListener("click", this.handleClickInside, true);
    document.removeEventListener("auxclick", this.handleClickInside, true);
    element.removeAttribute("contenteditable");
    element.style.outline = "";
    element.style.textTransform = textTransform;
    restoreNodes(element, nodes);
    element.blur();
    this.blocker.style.pointerEvents = "auto";
    this.onEnd({
      text,
      revert: () =>
        nodes.forEach((node, index) => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = values[index];
          }
        }),
    });
  }

  private readonly handleInput = (): void => {
    if (!this.editing) {
      return;
    }

    const { element, text } = this.editing;
    // Browsers write a no-break space for a trailing space and leave a line break placeholder in an emptied element.
    const value = element.textContent ? (element.innerText || element.textContent).replaceAll("\u00a0", " ") : "";
    this.onEdit({ itemId: text.itemId, path: text.path, value: text.multiline ? value : toSingleLine(value) });
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const isMultilineText = !!this.editing?.text.multiline;

    if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey && !isMultilineText)) {
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

  /** A click in the designer's panel is outside this frame, so only the blur reports it. */
  private readonly handleBlur = (): void => {
    this.end();
  };

  /** A click inside the text, also with the middle button, only places the caret: a link or button around it does not act. */
  private readonly handleClickInside = (event: MouseEvent): void => {
    if (this.editing?.element.contains(event.target as Node)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
}

function toSingleLine(value: string): string {
  if (!value.includes("\n")) {
    return value;
  }

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
}

/** Deleting the whole text replaces the nodes Vue rendered, and Vue would keep patching nodes no longer shown. */
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
