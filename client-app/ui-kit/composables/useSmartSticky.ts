import { useElementBounding, useThrottleFn } from "@vueuse/core";
import { computed, onBeforeUnmount, onMounted, ref, toValue, watch } from "vue";
import type { CSSProperties, MaybeRefOrGetter } from "vue";

type StickyModeType = "static" | "fixed" | "absolute";

const AFFIX_TYPES = {
  FIXED_TOP: "FIXED_TOP",
  FIXED_BOTTOM: "FIXED_BOTTOM",
  ABSOLUTE: "ABSOLUTE",
  STATIC_BOTTOM: "STATIC_BOTTOM",
  STATIC: "STATIC",
} as const;

type AffixType = (typeof AFFIX_TYPES)[keyof typeof AFFIX_TYPES];

interface ISmartStickyOptions {
  container: MaybeRefOrGetter<HTMLElement | null>;
  stickyElement: MaybeRefOrGetter<HTMLElement | null>;
  throttleDelay?: number;
  topOffsetVar?: string;
  bottomOffsetVar?: string;
  enabled?: MaybeRefOrGetter<boolean>;
  scrollContainer?: MaybeRefOrGetter<HTMLElement | Window>;
}

interface IDimensions {
  translate: number;
  topSpacing: number;
  bottomSpacing: number;
  elementHeight: number;
  elementWidth: number;
  containerTop: number;
  containerHeight: number;
  viewportHeight: number;
  viewportTop: number;
  lastViewportTop: number;
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
    bottomSpacing: 0,
    elementHeight: 0,
    elementWidth: 0,
    containerTop: 0,
    containerHeight: 0,
    viewportHeight: 0,
    viewportTop: 0,
    lastViewportTop: 0,
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
    const containerEl = toValue(container);

    if (!element || !containerEl) {
      return;
    }

    dimensions.value.viewportHeight = window.innerHeight;
    dimensions.value.viewportTop = getScrollPosition();

    const containerRect = containerEl.getBoundingClientRect();
    dimensions.value.containerTop = containerRect.top + dimensions.value.viewportTop;
    dimensions.value.containerHeight = containerRect.height;

    const stickyRect = element.getBoundingClientRect();
    dimensions.value.elementHeight = stickyRect.height;
    dimensions.value.elementWidth = stickyRect.width;

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
      elementHeight: eHeight,
      viewportHeight: vHeight,
      viewportTop: vTop,
      topSpacing: tSpacing,
      bottomSpacing: bSpacing,
    } = dims;

    const containerBottom = cTop + cHeight;
    const elementRect = element.getBoundingClientRect();
    const elementTop = elementRect.top + vTop;

    const isElementTallerThanViewport = eHeight + tSpacing + bSpacing > vHeight;

    const isScrollingDown = vTop > dims.lastViewportTop;
    const isScrollingUp = vTop < dims.lastViewportTop;

    const affixType = getAffixType(
      isElementTallerThanViewport,
      isScrollingDown,
      isScrollingUp,
      cTop,
      containerBottom,
      vTop,
      vHeight,
      eHeight,
      elementTop,
      tSpacing,
      bSpacing,
    );

    applyStyles(affixType, dims, elementTop, cTop);

    isStuckTop.value = affixType === AFFIX_TYPES.FIXED_TOP;
    isStuckBottom.value = affixType === AFFIX_TYPES.FIXED_BOTTOM;
    isActive.value = affixType !== AFFIX_TYPES.STATIC;

    dims.lastViewportTop = vTop;
  }

  function checkShortElement(
    viewportTop: number,
    topSpacing: number,
    containerTop: number,
    elementHeight: number,
    containerBottom: number,
  ): AffixType {
    if (viewportTop + topSpacing < containerTop) {
      return AFFIX_TYPES.STATIC;
    }

    if (viewportTop + topSpacing + elementHeight <= containerBottom) {
      return AFFIX_TYPES.FIXED_TOP;
    }

    return AFFIX_TYPES.STATIC_BOTTOM;
  }

  function checkScrollingDown(
    elementBottom: number,
    viewportBottom: number,
    bottomSpacing: number,
    elementHeight: number,
    containerBottom: number,
  ): AffixType {
    if (elementBottom <= viewportBottom - bottomSpacing) {
      const wouldBeBottom = viewportBottom - bottomSpacing - elementHeight;

      if (wouldBeBottom + elementHeight <= containerBottom) {
        return AFFIX_TYPES.FIXED_BOTTOM;
      }

      return AFFIX_TYPES.STATIC_BOTTOM;
    }

    if (elementBottom >= containerBottom) {
      return AFFIX_TYPES.STATIC_BOTTOM;
    }

    return AFFIX_TYPES.ABSOLUTE;
  }

  function checkScrollingUp(
    elementTop: number,
    viewportTop: number,
    topSpacing: number,
    containerTop: number,
  ): AffixType {
    if (elementTop >= viewportTop + topSpacing) {
      const wouldBeTop = viewportTop + topSpacing;

      if (wouldBeTop >= containerTop) {
        return AFFIX_TYPES.FIXED_TOP;
      }

      return AFFIX_TYPES.STATIC;
    }

    if (elementTop <= containerTop) {
      return AFFIX_TYPES.STATIC;
    }

    return AFFIX_TYPES.ABSOLUTE;
  }

  function getAffixType(
    isTaller: boolean,
    isScrollingDown: boolean,
    isScrollingUp: boolean,
    containerTop: number,
    containerBottom: number,
    viewportTop: number,
    viewportHeight: number,
    elementHeight: number,
    elementTop: number,
    topSpacing: number,
    bottomSpacing: number,
  ): AffixType {
    const viewportBottom = viewportTop + viewportHeight;
    const elementBottom = elementTop + elementHeight;

    if (!isTaller) {
      return checkShortElement(viewportTop, topSpacing, containerTop, elementHeight, containerBottom);
    }

    if (elementTop < containerTop) {
      return AFFIX_TYPES.STATIC;
    }

    if (elementBottom > containerBottom) {
      return AFFIX_TYPES.STATIC_BOTTOM;
    }

    if (isScrollingDown) {
      return checkScrollingDown(elementBottom, viewportBottom, bottomSpacing, elementHeight, containerBottom);
    }

    if (isScrollingUp) {
      return checkScrollingUp(elementTop, viewportTop, topSpacing, containerTop);
    }

    return AFFIX_TYPES.ABSOLUTE;
  }

  function applyStyles(affixType: AffixType, dims: IDimensions, elementTop: number, containerTop: number) {
    const element = toValue(stickyElement);

    if (!element) {
      return;
    }

    const baseStyle = {
      left: "auto",
      right: "auto",
      width: `${dims.elementWidth}px`,
    };

    switch (affixType) {
      case AFFIX_TYPES.FIXED_TOP: {
        mode.value = "fixed";
        style.value = {
          ...baseStyle,
          position: "fixed",
          top: `${dims.topSpacing}px`,
          bottom: "auto",
        };
        dims.translate = elementTop - containerTop;
        break;
      }

      case AFFIX_TYPES.FIXED_BOTTOM: {
        mode.value = "fixed";
        style.value = {
          ...baseStyle,
          position: "fixed",
          top: "auto",
          bottom: `${dims.bottomSpacing}px`,
        };
        dims.translate = elementTop - containerTop;
        break;
      }

      case AFFIX_TYPES.ABSOLUTE: {
        mode.value = "absolute";
        style.value = {
          ...baseStyle,
          position: "absolute",
          top: `${dims.translate}px`,
          bottom: "auto",
        };
        break;
      }

      case AFFIX_TYPES.STATIC_BOTTOM: {
        mode.value = "absolute";
        const bottomTop = dims.containerHeight - dims.elementHeight;

        style.value = {
          ...baseStyle,
          position: "absolute",
          top: `${bottomTop}px`,
          bottom: "auto",
        };
        dims.translate = bottomTop;
        break;
      }

      case AFFIX_TYPES.STATIC:
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
  const updateImmediate = calculatePosition;

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

    void update();
  });

  onBeforeUnmount(() => {
    destroy();
  });

  watch([stickyHeight, containerHeight], updateImmediate);

  watch(isEnabled, (newValue) => {
    if (newValue) {
      void update();
      return;
    }

    resetPosition();
  });

  return {
    style,
    mode,
    isActive,
    isStuckTop,
    isStuckBottom,
    update,
    destroy,
  };
}
