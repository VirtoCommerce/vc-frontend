export interface IOverlayLayerOptions {
  zIndex: string;
  render: () => void;
  onPointerMove: (event: MouseEvent) => void;
  onPointerLeave: () => void;
  onClick: (event: MouseEvent) => void;
  shouldRenderOnScroll?: boolean;
}

/** A layer over the whole page that renders when the page changes, with the pointer events of the blocker above it. */
export class OverlayLayer {
  readonly element: HTMLDivElement;
  private readonly resizeObserver: ResizeObserver | undefined;
  private frame: number | undefined;
  private disposed = false;

  constructor(
    body: HTMLElement,
    private readonly blocker: HTMLElement,
    private readonly options: IOverlayLayerOptions,
  ) {
    this.element = document.createElement("div");
    this.element.setAttribute("aria-hidden", "true");
    Object.assign(this.element.style, {
      position: "absolute",
      inset: "0",
      zIndex: options.zIndex,
      pointerEvents: "none",
    });
    body.appendChild(this.element);

    blocker.addEventListener("mousemove", options.onPointerMove);
    blocker.addEventListener("mouseleave", options.onPointerLeave);
    blocker.addEventListener("click", options.onClick);
    window.addEventListener("resize", this.scheduleRender);
    if (options.shouldRenderOnScroll) {
      window.addEventListener("scroll", this.scheduleRender, { passive: true });
    }

    // The page loads and moves after a render; the layer is absolute, so rendering into it cannot resize the body and loop.
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.scheduleRender);
      this.resizeObserver.observe(body);
    }
  }

  get isDisposed(): boolean {
    return this.disposed;
  }

  get isRenderScheduled(): boolean {
    return this.frame !== undefined;
  }

  /** Two frames, so the overlay is measured after the page has rendered. */
  readonly scheduleRender = (): void => {
    if (this.disposed) {
      return;
    }

    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
    }

    this.frame = requestAnimationFrame(() => {
      this.frame = requestAnimationFrame(() => {
        this.frame = undefined;
        this.options.render();
      });
    });
  };

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }

    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.scheduleRender);
    window.removeEventListener("scroll", this.scheduleRender);
    this.blocker.removeEventListener("mousemove", this.options.onPointerMove);
    this.blocker.removeEventListener("mouseleave", this.options.onPointerLeave);
    this.blocker.removeEventListener("click", this.options.onClick);
    this.element.remove();
  }
}
