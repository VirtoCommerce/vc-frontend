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
  private readonly layer: HTMLDivElement;
  private readonly resizeObserver: ResizeObserver | undefined;
  private rendered: IRenderedBoundary[] = [];
  private sectionIds: string[] = [];
  private boundaries: ISharedComponentBoundary[] = [];
  private highlightedPlacementId: string | null = null;
  private pendingScrollPlacementId: string | null = null;
  private pendingPointerPosition: { clientX: number; clientY: number } | null = null;
  private pointerFrame: number | undefined;
  private scheduledFrame: number | undefined;
  private disposed = false;

  constructor(
    private readonly body: HTMLElement,
    private readonly interactiveBlocker: HTMLElement,
    private readonly onSelect: (placementId: string) => void,
    private readonly onHover: (placementId: string | null) => void,
  ) {
    this.layer = document.createElement("div");
    this.layer.dataset.sharedComponentOverlay = "true";
    this.layer.setAttribute("aria-hidden", "true");
    Object.assign(this.layer.style, {
      position: "absolute",
      inset: "0",
      zIndex: "2147483645",
      pointerEvents: "none",
    });
    this.body.appendChild(this.layer);

    this.interactiveBlocker.addEventListener("mousemove", this.handlePointerMove);
    this.interactiveBlocker.addEventListener("mouseleave", this.handlePointerLeave);
    this.interactiveBlocker.addEventListener("click", this.handleClick);
    window.addEventListener("resize", this.scheduleRender);

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.scheduleRender);
      this.resizeObserver.observe(this.body);
    }
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
    this.scheduleRender();
  }

  highlight(placementId: string | null): void {
    this.highlightedPlacementId = placementId;
    this.applyHighlight();
  }

  scrollToPlacement(placementId: string): boolean {
    this.pendingScrollPlacementId = placementId;
    const boundaryExists = this.boundaries.some((boundary) => boundary.placementId === placementId);
    if (!boundaryExists) {
      return false;
    }

    if (this.scheduledFrame === undefined) {
      const scrolled = this.flushPendingScroll();
      if (!scrolled) {
        this.scheduleRender();
      }
    }

    return true;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.clearHover();
    this.disposed = true;
    if (this.scheduledFrame !== undefined) {
      cancelAnimationFrame(this.scheduledFrame);
      this.scheduledFrame = undefined;
    }
    this.cancelPendingPointer();

    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.scheduleRender);
    this.interactiveBlocker.removeEventListener("mousemove", this.handlePointerMove);
    this.interactiveBlocker.removeEventListener("mouseleave", this.handlePointerLeave);
    this.interactiveBlocker.removeEventListener("click", this.handleClick);
    this.layer.remove();
  }

  private readonly scheduleRender = (): void => {
    if (this.disposed) {
      return;
    }

    if (this.scheduledFrame !== undefined) {
      cancelAnimationFrame(this.scheduledFrame);
    }

    this.scheduledFrame = requestAnimationFrame(() => {
      this.scheduledFrame = requestAnimationFrame(() => {
        this.scheduledFrame = undefined;
        this.render();
      });
    });
  };

  private render(): void {
    this.layer.replaceChildren();
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
      this.layer.appendChild(element);
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
      if (!position || this.disposed) {
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

  private findPlacementAt(clientX: number, clientY: number): string | null {
    const rendered = this.rendered.find(({ element }) => {
      const rect = element.getBoundingClientRect();
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    });
    return rendered?.boundary.placementId ?? null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
