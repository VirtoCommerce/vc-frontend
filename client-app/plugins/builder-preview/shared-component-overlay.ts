import { isRecord } from "@/core/utilities";
import { OverlayLayer } from "./overlay-layer";
export interface ISharedComponentBoundary {
  placementId: string;
  componentRef: string;
  startIndex: number;
  count: number;
  label?: string;
}

interface IRenderedBoundary {
  boundary: ISharedComponentBoundary;
  element: HTMLDivElement;
}

const SCROLL_ANCHOR_PREFIX = "__scroll__";
export const SHARED_COMPONENT_END_ANCHOR_ID = "shared-components-end";

export function normalizeSharedComponentBoundaries(value: unknown): ISharedComponentBoundary[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((candidate): ISharedComponentBoundary[] => {
    if (!isRecord(candidate)) {
      return [];
    }

    const placementId = candidate.placementId;
    const componentRef = candidate.componentRef;
    const startIndex = candidate.startIndex;
    const count = candidate.count;

    if (
      typeof placementId !== "string" ||
      placementId.trim().length === 0 ||
      typeof componentRef !== "string" ||
      componentRef.trim().length === 0 ||
      !Number.isInteger(startIndex) ||
      (startIndex as number) < 0 ||
      !Number.isInteger(count) ||
      (count as number) <= 0
    ) {
      return [];
    }

    return [
      {
        placementId,
        componentRef,
        startIndex: startIndex as number,
        count: count as number,
        label: typeof candidate.label === "string" && candidate.label.trim() ? candidate.label.trim() : undefined,
      },
    ];
  });
}

export function getBoundaryAnchorIds(
  sectionIds: string[],
  boundary: ISharedComponentBoundary,
): { startId?: string; endId?: string } {
  if (boundary.startIndex >= sectionIds.length || boundary.startIndex + boundary.count > sectionIds.length) {
    return {};
  }

  return {
    startId: sectionIds[boundary.startIndex],
    endId: sectionIds[boundary.startIndex + boundary.count] ?? SHARED_COMPONENT_END_ANCHOR_ID,
  };
}

export class SharedComponentOverlay {
  private readonly layer: OverlayLayer;
  private rendered: IRenderedBoundary[] = [];
  private sectionIds: string[] = [];
  private boundaries: ISharedComponentBoundary[] = [];
  private highlightedPlacementId: string | null = null;
  private pendingScrollPlacementId: string | null = null;
  private pendingPointerPosition: { clientX: number; clientY: number } | null = null;
  private pointerFrame: number | undefined;

  constructor(
    private readonly body: HTMLElement,
    interactiveBlocker: HTMLElement,
    private readonly onSelect: (placementId: string) => void,
    private readonly onHover: (placementId: string | null) => void,
  ) {
    this.layer = new OverlayLayer(this.body, interactiveBlocker, {
      zIndex: "2147483645",
      render: () => this.render(),
      onPointerMove: this.handlePointerMove,
      onPointerLeave: this.handlePointerLeave,
      onClick: this.handleClick,
      isInitiallyEnabled: true,
    });
    this.layer.element.dataset.sharedComponentOverlay = "true";
  }

  update(sectionIds: string[], boundaries: ISharedComponentBoundary[]): void {
    this.cancelPendingPointer();
    this.sectionIds = sectionIds;
    this.boundaries = boundaries;
    if (
      this.highlightedPlacementId !== null &&
      !boundaries.some((boundary) => boundary.placementId === this.highlightedPlacementId)
    ) {
      this.clearHover();
    }
    this.layer.scheduleRender();
  }

  highlight(placementId: string | null): void {
    this.highlightedPlacementId = placementId;
    this.applyHighlight();
  }

  scrollToPlacement(placementId: string): boolean {
    const boundaryExists = this.boundaries.some((boundary) => boundary.placementId === placementId);
    this.pendingScrollPlacementId = boundaryExists ? placementId : null;
    if (!boundaryExists) {
      return false;
    }

    if (!this.layer.isRenderScheduled) {
      const scrolled = this.flushPendingScroll();
      if (!scrolled) {
        this.layer.scheduleRender();
      }
    }

    return true;
  }

  setEnabled(isEnabled: boolean): void {
    this.layer.setEnabled(isEnabled);

    if (!isEnabled) {
      this.cancelPendingPointer();
      this.highlight(null);
    }
  }

  findPlacementAt(clientX: number, clientY: number): string | null {
    if (!this.layer.isEnabled) {
      return null;
    }

    const rendered = this.rendered.find(({ element }) => {
      const rect = element.getBoundingClientRect();
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    });
    return rendered?.boundary.placementId ?? null;
  }

  dispose(): void {
    if (this.layer.isDisposed) {
      return;
    }

    this.clearHover();
    this.cancelPendingPointer();
    this.layer.dispose();
  }

  private render(): void {
    this.layer.element.replaceChildren();
    this.rendered = this.boundaries.flatMap((boundary): IRenderedBoundary[] => {
      const anchors = getBoundaryAnchorIds(this.sectionIds, boundary);
      const startAnchor = anchors.startId && document.getElementById(SCROLL_ANCHOR_PREFIX + anchors.startId);
      const endAnchor = anchors?.endId && document.getElementById(SCROLL_ANCHOR_PREFIX + anchors.endId);
      if (!startAnchor) {
        return [];
      }

      const startRect = startAnchor.getBoundingClientRect();
      const endTop = endAnchor
        ? endAnchor.getBoundingClientRect().top + window.scrollY
        : Math.max(this.body.scrollHeight, document.documentElement.scrollHeight);
      const top = startRect.top + window.scrollY;
      const element = this.createBoundaryElement(boundary);
      Object.assign(element.style, {
        top: `${top}px`,
        left: "0",
        width: `${Math.max(this.body.scrollWidth, document.documentElement.clientWidth)}px`,
        height: `${Math.max(2, endTop - top)}px`,
      });
      this.layer.element.appendChild(element);
      return [{ boundary, element }];
    });

    this.applyHighlight();
    this.flushPendingScroll();
  }

  private flushPendingScroll(): boolean {
    if (this.pendingScrollPlacementId === null) {
      return false;
    }

    const boundary = this.boundaries.find((item) => item.placementId === this.pendingScrollPlacementId);
    const startId = boundary && getBoundaryAnchorIds(this.sectionIds, boundary).startId;
    const startAnchor = startId && document.getElementById(SCROLL_ANCHOR_PREFIX + startId);
    if (!startAnchor) {
      return false;
    }

    this.pendingScrollPlacementId = null;
    const top = startAnchor.getBoundingClientRect().top + window.scrollY - window.innerHeight / 10;
    window.scroll({ top, behavior: "smooth" });
    return true;
  }

  private createBoundaryElement(boundary: ISharedComponentBoundary): HTMLDivElement {
    const element = document.createElement("div");
    element.dataset.sharedComponentPlacement = boundary.placementId;
    Object.assign(element.style, {
      position: "absolute",
      boxSizing: "border-box",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "var(--color-success-600)",
      borderRadius: "6px",
      transition: "border-color 120ms ease, box-shadow 120ms ease",
    });

    if (boundary.label) {
      const label = document.createElement("span");
      label.textContent = boundary.label;
      Object.assign(label.style, {
        position: "absolute",
        top: "0",
        right: "14px",
        transform: "translateY(-1px)",
        maxWidth: "calc(100% - 28px)",
        overflow: "hidden",
        padding: "4px 10px",
        borderRadius: "0 0 0 5px",
        background: "var(--color-success-700)",
        color: "var(--color-additional-50)",
        fontFamily: "inherit",
        fontSize: "12px",
        fontWeight: "600",
        lineHeight: "18px",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      });
      element.appendChild(label);
    }
    return element;
  }

  private applyHighlight(): void {
    this.rendered.forEach(({ boundary, element }) => {
      const highlighted = boundary.placementId === this.highlightedPlacementId;
      element.style.borderColor = highlighted ? "var(--color-success-800)" : "var(--color-success-600)";
      element.style.boxShadow = highlighted ? "0 0 0 3px var(--color-success-100)" : "none";
    });
  }

  private readonly handlePointerMove = (event: MouseEvent): void => {
    this.pendingPointerPosition = { clientX: event.clientX, clientY: event.clientY };
    if (this.pointerFrame !== undefined) {
      return;
    }

    this.pointerFrame = requestAnimationFrame(() => {
      this.pointerFrame = undefined;
      const position = this.pendingPointerPosition;
      this.pendingPointerPosition = null;
      if (!position || this.layer.isDisposed) {
        return;
      }

      this.updateHoverAt(position.clientX, position.clientY);
    });
  };

  private updateHoverAt(clientX: number, clientY: number): void {
    const placementId = this.findPlacementAt(clientX, clientY);
    if (placementId === this.highlightedPlacementId) {
      return;
    }

    this.highlight(placementId);
    this.onHover(placementId);
  }

  private readonly handlePointerLeave = (): void => {
    this.cancelPendingPointer();
    this.clearHover();
  };

  private cancelPendingPointer(): void {
    if (this.pointerFrame !== undefined) {
      cancelAnimationFrame(this.pointerFrame);
      this.pointerFrame = undefined;
    }
    this.pendingPointerPosition = null;
  }

  private readonly handleClick = (event: MouseEvent): void => {
    const placementId = this.findPlacementAt(event.clientX, event.clientY);
    if (placementId) {
      this.onSelect(placementId);
    }
  };

  private clearHover(): void {
    if (this.highlightedPlacementId === null) {
      return;
    }

    this.highlight(null);
    this.onHover(null);
  }
}
