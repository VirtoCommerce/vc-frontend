import { useElementBounding, useResizeObserver, useThrottleFn } from "@vueuse/core";
import { computed, onBeforeUnmount, onMounted, ref, toValue, watch } from "vue";
import type { CSSProperties, MaybeRefOrGetter } from "vue";

type StickyModeType = "static" | "fixed" | "absolute";

interface ISmartStickyOptions {
  container: MaybeRefOrGetter<HTMLElement | null>;
  stickyElement: MaybeRefOrGetter<HTMLElement | null>;
  throttleDelay?: number;
  topOffsetVar?: string;
  bottomOffsetVar?: string;
  enabled?: MaybeRefOrGetter<boolean>;
  scrollContainer?: MaybeRefOrGetter<HTMLElement | Window>;
}

interface ISmartStickyState {
  mode: StickyModeType;
  distanceFromTop: number;
  distanceFromBottom: number;
  topPosition: number;
  bottomPosition: number;
  isStuckTop: boolean;
  isStuckBottom: boolean;
  isActive: boolean;
}

interface IDimensions {
  translate: number;
  topSpacing: number;
  lastTopSpacing: number;
  bottomSpacing: number;
  lastBottomSpacing: number;
  sidebarHeight: number;
  sidebarWidth: number;
  containerTop: number;
  containerHeight: number;
  viewportHeight: number;
  viewportTop: number;
  lastViewportTop: number;
  lastViewportHeight: number;
}

const BOUNDING_OPTIONS = { windowResize: true, immediate: true };

export function useSmartSticky(options: ISmartStickyOptions) {
  const {
    container,
    stickyElement,
    throttleDelay = 50,
    topOffsetVar = "--sticky-offset-top",
    bottomOffsetVar = "--sticky-offset-bottom",
    enabled = true,
    scrollContainer = window,
  } = options;

  const style = ref<CSSProperties>({});
  const mode = ref<StickyModeType>("static");
  const isActive = ref(false);
  const isStuckTop = ref(false);
  const isStuckBottom = ref(false);

  const dimensions = ref<IDimensions>({
    translate: 0,
    topSpacing: 0,
    lastTopSpacing: 0,
    bottomSpacing: 0,
    lastBottomSpacing: 0,
    sidebarHeight: 0,
    sidebarWidth: 0,
    containerTop: 0,
    containerHeight: 0,
    viewportHeight: 0,
    viewportTop: 0,
    lastViewportTop: 0,
    lastViewportHeight: 0,
  });

  const { height: containerHeight } = useElementBounding(container, BOUNDING_OPTIONS);
  const { height: stickyHeight } = useElementBounding(stickyElement, BOUNDING_OPTIONS);

  const isEnabled = computed(() => toValue(enabled));

  function getScrollPosition(): number {
    const scrollEl = toValue(scrollContainer);

    if (scrollEl === window) {
      return window.pageYOffset || document.documentElement.scrollTop;
    }

    return (scrollEl as HTMLElement).scrollTop;
  }

  function parseCssValue(value: string): number {
    const match = /(\d+(?:\.\d+)?)/.exec(value);
    return match ? Number(match[0]) : 0;
  }

  function updateDimensions() {
    const element = toValue(stickyElement);

    if (!element) {
      return;
    }

    const viewport = window;
    const containerEl = toValue(container);

    dimensions.value.viewportHeight = viewport.innerHeight;
    dimensions.value.viewportTop = getScrollPosition();

    if (containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      dimensions.value.containerTop = containerRect.top + dimensions.value.viewportTop;
      dimensions.value.containerHeight = containerRect.height;
    }

    const stickyRect = element.getBoundingClientRect();
    dimensions.value.sidebarHeight = stickyRect.height;
    dimensions.value.sidebarWidth = stickyRect.width;

    const computedStyle = getComputedStyle(element);
    const topVar = computedStyle.getPropertyValue(topOffsetVar).trim();
    const bottomVar = computedStyle.getPropertyValue(bottomOffsetVar).trim();

    dimensions.value.topSpacing = topVar ? parseCssValue(topVar) : 0;
    dimensions.value.bottomSpacing = bottomVar ? parseCssValue(bottomVar) : 0;
  }

  function calculatePosition() {
    if (!isEnabled.value) {
      resetPosition();
      return;
    }

    const element = toValue(stickyElement);
    const containerEl = toValue(container);

    if (!element || !containerEl) {
      return;
    }

    updateDimensions();

    const dims = dimensions.value;
    const {
      containerTop: cTop,
      containerHeight: cHeight,
      sidebarHeight: sHeight,
      viewportHeight: vHeight,
      viewportTop: vTop,
      topSpacing: tSpacing,
      bottomSpacing: bSpacing,
    } = dims;

    const containerBottom = cTop + cHeight;
    const elementRect = element.getBoundingClientRect();
    const sidebarTop = elementRect.top + vTop;

    const isSidebarTallerThanViewport = sHeight + tSpacing + bSpacing > vHeight;

    const isScrollingDown = vTop > dims.lastViewportTop;
    const isScrollingUp = vTop < dims.lastViewportTop;

    const affixType = getAffixType(
      isSidebarTallerThanViewport,
      isScrollingDown,
      isScrollingUp,
      cTop,
      containerBottom,
      vTop,
      vHeight,
      sHeight,
      sidebarTop,
      tSpacing,
      bSpacing,
    );

    applyStyles(affixType, dims, sidebarTop, cTop);

    isStuckTop.value = affixType === "FIXED_TOP";
    isStuckBottom.value = affixType === "FIXED_BOTTOM";
    isActive.value = affixType !== "STATIC";

    dims.lastViewportTop = vTop;
    dims.lastViewportHeight = vHeight;
    dims.lastTopSpacing = tSpacing;
    dims.lastBottomSpacing = bSpacing;
  }

  function checkShortSidebar(
    viewportTop: number,
    elTopSpacing: number,
    elContainerTop: number,
    sidebarHeight: number,
    elContainerBottom: number,
  ): string {
    if (viewportTop + elTopSpacing < elContainerTop) {
      return "STATIC";
    }

    if (viewportTop + elTopSpacing + sidebarHeight <= elContainerBottom) {
      return "FIXED_TOP";
    }

    return "STATIC_BOTTOM";
  }

  function checkScrollingDown(
    sidebarBottom: number,
    viewportBottom: number,
    elBottomSpacing: number,
    sidebarHeight: number,
    elContainerBottom: number,
  ): string {
    if (sidebarBottom <= viewportBottom - elBottomSpacing) {
      const wouldBeBottom = viewportBottom - elBottomSpacing - sidebarHeight;

      if (wouldBeBottom + sidebarHeight <= elContainerBottom) {
        return "FIXED_BOTTOM";
      }

      return "STATIC_BOTTOM";
    }

    if (sidebarBottom >= elContainerBottom) {
      return "STATIC_BOTTOM";
    }

    return "ABSOLUTE";
  }

  function checkScrollingUp(
    sidebarTop: number,
    viewportTop: number,
    elTopSpacing: number,
    elContainerTop: number,
  ): string {
    if (sidebarTop >= viewportTop + elTopSpacing) {
      const wouldBeTop = viewportTop + elTopSpacing;

      if (wouldBeTop >= elContainerTop) {
        return "FIXED_TOP";
      }

      return "STATIC";
    }

    if (sidebarTop <= elContainerTop) {
      return "STATIC";
    }

    return "ABSOLUTE";
  }

  function getAffixType(
    isTaller: boolean,
    isScrollingDown: boolean,
    isScrollingUp: boolean,
    elContainerTop: number,
    elContainerBottom: number,
    viewportTop: number,
    viewportHeight: number,
    sidebarHeight: number,
    sidebarTop: number,
    elTopSpacing: number,
    elBottomSpacing: number,
  ): string {
    const viewportBottom = viewportTop + viewportHeight;
    const sidebarBottom = sidebarTop + sidebarHeight;

    if (!isTaller) {
      return checkShortSidebar(viewportTop, elTopSpacing, elContainerTop, sidebarHeight, elContainerBottom);
    }

    if (sidebarTop < elContainerTop) {
      return "STATIC";
    }

    if (sidebarBottom > elContainerBottom) {
      return "STATIC_BOTTOM";
    }

    if (isScrollingDown) {
      return checkScrollingDown(sidebarBottom, viewportBottom, elBottomSpacing, sidebarHeight, elContainerBottom);
    }

    if (isScrollingUp) {
      return checkScrollingUp(sidebarTop, viewportTop, elTopSpacing, elContainerTop);
    }

    return "ABSOLUTE";
  }

  function applyStyles(affixType: string, dims: IDimensions, sidebarTop: number, containerTop: number) {
    const element = toValue(stickyElement);

    if (!element) {
      return;
    }

    switch (affixType) {
      case "FIXED_TOP": {
        mode.value = "fixed";
        style.value = {
          position: "fixed",
          top: `${dims.topSpacing}px`,
          left: "auto",
          right: "auto",
          bottom: "auto",
          width: `${dims.sidebarWidth}px`,
        };
        dims.translate = sidebarTop - containerTop;
        break;
      }

      case "FIXED_BOTTOM": {
        mode.value = "fixed";
        style.value = {
          position: "fixed",
          top: "auto",
          left: "auto",
          right: "auto",
          bottom: `${dims.bottomSpacing}px`,
          width: `${dims.sidebarWidth}px`,
        };
        dims.translate = sidebarTop - containerTop;
        break;
      }

      case "ABSOLUTE": {
        mode.value = "absolute";

        style.value = {
          position: "absolute",
          top: `${dims.translate}px`,
          left: "auto",
          right: "auto",
          bottom: "auto",
          width: `${dims.sidebarWidth}px`,
        };
        break;
      }

      case "STATIC_BOTTOM": {
        mode.value = "absolute";
        const bottomTop = dims.containerHeight - dims.sidebarHeight;

        style.value = {
          position: "absolute",
          top: `${bottomTop}px`,
          left: "auto",
          right: "auto",
          bottom: "auto",
          width: `${dims.sidebarWidth}px`,
        };
        dims.translate = bottomTop;
        break;
      }

      case "STATIC":
      default: {
        mode.value = "static";
        style.value = {
          position: "static",
        };
        dims.translate = 0;
        break;
      }
    }
  }

  function resetPosition() {
    mode.value = "static";
    style.value = {
      position: "static",
    };
    isActive.value = false;
    isStuckTop.value = false;
    isStuckBottom.value = false;
    dimensions.value.translate = 0;
  }

  const update = useThrottleFn(calculatePosition, throttleDelay);

  function destroy() {
    const scrollEl = toValue(scrollContainer);

    if (scrollEl === window) {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    } else {
      (scrollEl as HTMLElement).removeEventListener("scroll", update);
    }

    resetPosition();
  }

  onMounted(() => {
    const scrollEl = toValue(scrollContainer);

    if (scrollEl === window) {
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    } else {
      (scrollEl as HTMLElement).addEventListener("scroll", update, { passive: true });
    }

    const element = toValue(stickyElement);
    const containerEl = toValue(container);

    if (element) {
      useResizeObserver(element, update);
    }

    if (containerEl) {
      useResizeObserver(containerEl, update);

      let mutationTimeout: ReturnType<typeof setTimeout> | null = null;
      const mutationObserver = new MutationObserver(() => {
        if (mutationTimeout) {
          clearTimeout(mutationTimeout);
        }

        mutationTimeout = setTimeout(() => {
          void update();
          mutationTimeout = null;
        }, 50);
      });

      mutationObserver.observe(containerEl, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      onBeforeUnmount(() => {
        mutationObserver.disconnect();

        if (mutationTimeout) {
          clearTimeout(mutationTimeout);
        }
      });
    }

    void update();
  });

  onBeforeUnmount(() => {
    destroy();
  });

  watch([stickyHeight, containerHeight], update);

  watch(isEnabled, (newValue) => {
    if (newValue) {
      void update();
      return;
    }

    resetPosition();
  });

  const state = computed<ISmartStickyState>(() => ({
    mode: mode.value,
    distanceFromTop: dimensions.value.containerTop - dimensions.value.viewportTop,
    distanceFromBottom: dimensions.value.containerTop + dimensions.value.containerHeight - dimensions.value.viewportTop,
    topPosition: dimensions.value.viewportTop,
    bottomPosition: dimensions.value.viewportTop + dimensions.value.viewportHeight,
    isStuckTop: isStuckTop.value,
    isStuckBottom: isStuckBottom.value,
    isActive: isActive.value,
  }));

  return {
    style,
    state,
    mode,
    isActive,
    isStuckTop,
    isStuckBottom,
    update,
    destroy,
  };
}
