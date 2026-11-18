export interface IOverlayLayerOptions {
  zIndex: string;
  render: () => void;
  onPointerMove: (event: MouseEvent) => void;
  onPointerLeave: () => void;
  onClick: (event: MouseEvent) => void;
  shouldRenderOnScroll?: boolean;
  isInitiallyEnabled: boolean;
}

/** A layer over the whole page that renders when the page changes, with the pointer events of the blocker above it. */
export class OverlayLayer {
  readonly element: HTMLDivElement;
  private readonly resizeObserver: ResizeObserver | undefined;
  private frame: number | undefined;
  private disposed = false;
  private enabled: boolean;

  constructor(
    body: HTMLElement,
    private readonly blocker: HTMLElement,
    private readonly options: IOverlayLayerOptions,
  ) {
    this.enabled = options.isInitiallyEnabled;
    this.element = document.createElement("div");
    this.element.setAttribute("aria-hidden", "true");
    this.element.dataset.testId = "page-builder-overlay-layer";
    Object.assign(this.element.style, {
      position: "absolute",
      inset: "0",
      zIndex: options.zIndex,
      pointerEvents: "none",
      display: this.enabled ? "" : "none",
    });
    body.appendChild(this.element);

    blocker.addEventListener("mousemove", this.handlePointerMove);
    blocker.addEventListener("mouseleave", this.handlePointerLeave);
    blocker.addEventListener("click", this.handleClick);
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

  get isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(isEnabled: boolean): void {
    this.enabled = isEnabled;
    this.element.style.display = isEnabled ? "" : "none";
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
    this.blocker.removeEventListener("mousemove", this.handlePointerMove);
    this.blocker.removeEventListener("mouseleave", this.handlePointerLeave);
    this.blocker.removeEventListener("click", this.handleClick);
    this.element.remove();
  }

  private readonly handlePointerMove = (event: MouseEvent): void => {
    if (this.enabled) {
      this.options.onPointerMove(event);
    }
  };

  private readonly handlePointerLeave = (): void => {
    if (this.enabled) {
      this.options.onPointerLeave();
    }
  };

  private readonly handleClick = (event: MouseEvent): void => {
    if (this.enabled) {
      this.options.onClick(event);
    }
  };
}
