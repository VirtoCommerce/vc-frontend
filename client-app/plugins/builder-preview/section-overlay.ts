/** The attribute the storefront marks a section's element with in the designer preview, and only there. */
export const SECTION_ATTRIBUTE = "data-pb-section";
/** The attribute that names the setting a text shows, for texts a component does not render as is. */
export const FIELD_ATTRIBUTE = "data-pb-field";

const OUTLINE_COLOR = "#2563eb";
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
  private isEnabled = false;
  private frame: number | undefined;

  constructor(
    body: HTMLElement,
    private readonly blocker: HTMLElement,
    /** A click selected a section, or a block inside one (its innermost marked element). */
    private readonly onSelect: (selection: { sectionId: string; blockId?: string }, event: MouseEvent) => void,
    private readonly onHover: (sectionId: string | null) => void,
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

  select(sectionId: string | null): void {
    this.selected = sectionId;
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
        this.place(this.selectBox, this.selected);
        this.place(this.hoverBox, this.hovered === this.selected ? null : this.hovered);
      });
    });
  };

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

    const sectionId = this.sectionAt(event.clientX, event.clientY);

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
    const innermost = this.isEnabled ? this.sectionAt(event.clientX, event.clientY) : null;

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
