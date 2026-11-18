import { SECTION_ATTRIBUTE } from "@/core/theme-snapshot";
import { OverlayLayer } from "./overlay-layer";

export const OUTLINE_COLOR = "#2563eb";
const LABEL_TEXT_COLOR = "#ffffff";
/** Above every storefront element, under the click blocker. */
const OVERLAY_Z_INDEX = "2147483646";

function findSectionElement(sectionId: string): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>(`[${SECTION_ATTRIBUTE}]`)].find(
    (element) => element.getAttribute(SECTION_ATTRIBUTE) === sectionId,
  );
}

export class SectionOverlay {
  private readonly layer: OverlayLayer;
  private readonly hoverBox: HTMLDivElement;
  private readonly selectBox: HTMLDivElement;
  private labels: Record<string, string> = {};
  private hovered: string | null = null;
  private selected: string | null = null;
  /** The section outlined in place of a selected block that has no element of its own on the page. */
  private selectedFallback: string | null = null;
  /** The selection is scrolled to once it has an element: a page may render it after its data has loaded. */
  private isScrollPending = false;

  constructor(
    body: HTMLElement,
    private readonly blocker: HTMLElement,
    private readonly onSelect: (selection: { sectionId: string; blockId?: string }, event: MouseEvent) => void,
    private readonly onHover: (sectionId: string | null) => void,
    /** The shared component placement at a point: hovered as a whole, as its sections are not the page's. */
    private readonly placementAt: (clientX: number, clientY: number) => string | null = () => null,
  ) {
    this.layer = new OverlayLayer(body, blocker, {
      zIndex: OVERLAY_Z_INDEX,
      render: () => this.render(),
      onPointerMove: this.handlePointerMove,
      onPointerLeave: this.handlePointerLeave,
      onClick: this.handleClick,
      shouldRenderOnScroll: true,
      isInitiallyEnabled: false,
    });
    this.hoverBox = createBox("1px dashed");
    this.selectBox = createBox("2px solid");
    this.selectBox.dataset.testId = "page-builder-section-selection";
    this.layer.element.append(this.hoverBox, this.selectBox);
  }

  setEnabled(isEnabled: boolean): void {
    this.layer.setEnabled(isEnabled);
    this.scheduleRender();
  }

  setLabels(labels: Record<string, string>): void {
    this.labels = labels;
    this.scheduleRender();
  }

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

  scheduleRender(): void {
    this.layer.scheduleRender();
  }

  dispose(): void {
    this.layer.dispose();
  }

  private render(): void {
    const selected = this.selected && findSectionElement(this.selected) ? this.selected : this.selectedFallback;
    this.place(this.selectBox, selected);
    this.place(this.hoverBox, this.hovered === selected ? null : this.hovered);
    this.scrollToSelected(selected);
  }

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

    if (!this.layer.isEnabled || !sectionId || !rect?.height) {
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

  private sectionAt(clientX: number, clientY: number): string | null {
    const marked = document
      .elementsFromPoint(clientX, clientY)
      .find((element) => element !== this.blocker && element.closest(`[${SECTION_ATTRIBUTE}]`))
      ?.closest(`[${SECTION_ATTRIBUTE}]`);

    return marked?.getAttribute(SECTION_ATTRIBUTE) ?? null;
  }

  private readonly handlePointerMove = (event: MouseEvent): void => {
    const hoveredId = this.placementAt(event.clientX, event.clientY) ?? this.sectionAt(event.clientX, event.clientY);

    if (hoveredId !== this.hovered) {
      this.hover(hoveredId);
      this.onHover(hoveredId);
    }
  };

  private readonly handlePointerLeave = (): void => {
    if (this.hovered) {
      this.hover(null);
      this.onHover(null);
    }
  };

  private readonly handleClick = (event: MouseEvent): void => {
    const isAvailable = !this.placementAt(event.clientX, event.clientY);
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
