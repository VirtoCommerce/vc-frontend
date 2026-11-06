import { SECTION_ATTRIBUTE } from "./utils";

/** The attribute that names the setting a text shows, for texts a component does not render as is. */
export const FIELD_ATTRIBUTE = "data-pb-field";

export const OUTLINE_COLOR = "#2563eb";
const LABEL_TEXT_COLOR = "#ffffff";
/** Above every storefront element, under the click blocker. */
const OVERLAY_Z_INDEX = "2147483646";

/** The element a section with this id is rendered as, on the page. */
export function findSectionElement(sectionId: string): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>(`[${SECTION_ATTRIBUTE}]`)].find(
    (element) => element.getAttribute(SECTION_ATTRIBUTE) === sectionId,
  );
}

/**
 * Outlines sections in the designer preview, as a theme editor does: the section under the pointer gets a dashed
 * outline and its name, the selected one a solid outline; a click selects it. A section is the element marked with
 * its id, so the page's sections, the template's and the header and footer groups' take part alike.
 */
export class SectionOverlay {
  private readonly layer: HTMLDivElement;
  private readonly hoverBox: HTMLDivElement;
  private readonly selectBox: HTMLDivElement;
  private labels: Record<string, string> = {};
  private hovered: string | null = null;
  private selected: string | null = null;
  /** The section outlined in place of a selected block that has no element of its own on the page. */
  private selectedFallback: string | null = null;
  /** The selection is scrolled to once it has an element: a page may render it after its data has loaded. */
  private isScrollPending = false;
  private isEnabled = false;
  private frame: number | undefined;

  constructor(
    body: HTMLElement,
    private readonly blocker: HTMLElement,
    /** A click selected a section, or a block inside one (its innermost marked element). */
    private readonly onSelect: (selection: { sectionId: string; blockId?: string }, event: MouseEvent) => void,
    private readonly onHover: (sectionId: string | null) => void,
    /** A point another overlay takes, as a shared component's placement: its sections are not the page's. */
    private readonly isPointTaken: (clientX: number, clientY: number) => boolean = () => false,
  ) {
    this.layer = document.createElement("div");
    this.layer.setAttribute("aria-hidden", "true");
    Object.assign(this.layer.style, {
      position: "absolute",
      inset: "0",
      zIndex: OVERLAY_Z_INDEX,
      pointerEvents: "none",
    });
    this.hoverBox = createBox("1px dashed");
    this.selectBox = createBox("2px solid");
    this.layer.append(this.hoverBox, this.selectBox);
    body.appendChild(this.layer);

    blocker.addEventListener("mousemove", this.handlePointerMove);
    blocker.addEventListener("mouseleave", this.handlePointerLeave);
    blocker.addEventListener("click", this.handleClick);
    window.addEventListener("resize", this.scheduleRender);
    window.addEventListener("scroll", this.scheduleRender, { passive: true });

    // Sections render, load and move after the message that selected them. The layer is positioned absolutely, so
    // placing its boxes does not resize the body again.
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(this.scheduleRender).observe(body);
    }
  }

  /** Turns the outlines and section selection on or off. */
  setEnabled(isEnabled: boolean): void {
    this.isEnabled = isEnabled;
    this.layer.style.display = isEnabled ? "block" : "none";
    this.scheduleRender();
  }

  /** The names of the outlines, by section id. */
  setLabels(labels: Record<string, string>): void {
    this.labels = labels;
    this.scheduleRender();
  }

  /**
   * Selects a section or block; `fallbackId`, its section, is outlined while the block has no element of its own.
   * With `scroll`, the first of them to have an element is scrolled to.
   */
  select(sectionId: string | null, fallbackId: string | null = null, scroll = false): void {
    this.selected = sectionId;
    this.selectedFallback = fallbackId;
    this.isScrollPending = scroll && sectionId !== null;
    this.scheduleRender();
  }

  hover(sectionId: string | null): void {
    this.hovered = sectionId;
    this.scheduleRender();
  }

  /** The page changed under the outlines: place them again once it has rendered. */
  readonly scheduleRender = (): void => {
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
    }

    this.frame = requestAnimationFrame(() => {
      this.frame = requestAnimationFrame(() => {
        this.frame = undefined;
        const selected = this.selected && findSectionElement(this.selected) ? this.selected : this.selectedFallback;
        this.place(this.selectBox, selected);
        this.place(this.hoverBox, this.hovered === selected ? null : this.hovered);
        this.scrollToSelected(selected);
      });
    });
  };

  private scrollToSelected(sectionId: string | null): void {
    const element = this.isScrollPending && sectionId ? findSectionElement(sectionId) : undefined;

    if (element) {
      this.isScrollPending = false;
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  private place(box: HTMLDivElement, sectionId: string | null): void {
    const element = sectionId ? findSectionElement(sectionId) : undefined;
    const rect = element?.getBoundingClientRect();

    if (!this.isEnabled || !sectionId || !rect?.height) {
      box.style.display = "none";
      return;
    }

    Object.assign(box.style, {
      display: "block",
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    (box.firstChild as HTMLElement).textContent = this.labels[sectionId] ?? "";
  }

  /** The innermost marked section under the pointer: a block's section inside a section is the block. */
  sectionAt(clientX: number, clientY: number): string | null {
    const marked = document
      .elementsFromPoint(clientX, clientY)
      .find((element) => element !== this.blocker && element.closest(`[${SECTION_ATTRIBUTE}]`))
      ?.closest(`[${SECTION_ATTRIBUTE}]`);

    return marked?.getAttribute(SECTION_ATTRIBUTE) ?? null;
  }

  private readonly handlePointerMove = (event: MouseEvent): void => {
    if (!this.isEnabled) {
      return;
    }

    const sectionId = this.isPointTaken(event.clientX, event.clientY)
      ? null
      : this.sectionAt(event.clientX, event.clientY);

    if (sectionId !== this.hovered) {
      this.hover(sectionId);
      this.onHover(sectionId);
    }
  };

  private readonly handlePointerLeave = (): void => {
    if (this.isEnabled && this.hovered) {
      this.hover(null);
      this.onHover(null);
    }
  };

  private readonly handleClick = (event: MouseEvent): void => {
    const isAvailable = this.isEnabled && !this.isPointTaken(event.clientX, event.clientY);
    const innermost = isAvailable ? this.sectionAt(event.clientX, event.clientY) : null;

    if (!innermost) {
      return;
    }

    const parent = findSectionElement(innermost)?.parentElement?.closest(`[${SECTION_ATTRIBUTE}]`);
    const sectionId = parent?.getAttribute(SECTION_ATTRIBUTE) ?? innermost;
    this.select(sectionId);
    this.onSelect(sectionId === innermost ? { sectionId } : { sectionId, blockId: innermost }, event);
  };
}

function createBox(border: string): HTMLDivElement {
  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "absolute",
    boxSizing: "border-box",
    border: `${border} ${OUTLINE_COLOR}`,
    display: "none",
  });

  const label = document.createElement("span");
  Object.assign(label.style, {
    position: "absolute",
    top: "0",
    left: "0",
    padding: "3px 8px",
    background: OUTLINE_COLOR,
    color: LABEL_TEXT_COLOR,
    fontFamily: "system-ui, sans-serif",
    fontSize: "12px",
    lineHeight: "16px",
    whiteSpace: "nowrap",
  });
  box.appendChild(label);

  return box;
}
