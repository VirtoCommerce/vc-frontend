import { useCssVar, useElementBounding, useThrottleFn } from "@vueuse/core";
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

interface IAffixTypeParams {
  isTaller: boolean;
  isScrollingDown: boolean;
  isScrollingUp: boolean;
  containerTop: number;
  containerBottom: number;
  viewportTop: number;
  viewportHeight: number;
  elementHeight: number;
  elementTop: number;
  topSpacing: number;
  bottomSpacing: number;
}

const BOUNDING_OPTIONS = { windowResize: true, immediate: true };

const DEFAULT_THROTTLE_DELAY = 50;

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

function getAffixType(params: IAffixTypeParams): AffixType {
  const {
    isTaller,
    isScrollingDown,
    isScrollingUp,
    containerTop,
    containerBottom,
    viewportTop,
    viewportHeight,
    elementHeight,
    elementTop,
    topSpacing,
    bottomSpacing,
  } = params;

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

export function useSmartSticky(options: ISmartStickyOptions) {
  const {
    container,
    stickyElement,
    throttleDelay = DEFAULT_THROTTLE_DELAY,
    topOffsetVar = "--sticky-offset-top",
    bottomOffsetVar = "--sticky-offset-bottom",
    enabled = true,
    scrollContainer = globalThis.window,
  } = options;

  const style = ref<CSSProperties>({});
  const mode = ref<StickyModeType>("static");
  const isActive = ref(false);
  const isStuckTop = ref(false);
  const isStuckBottom = ref(false);
  const translate = ref(0);

  const dimensions = ref<IDimensions>({
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

  const boundingContainer = useElementBounding(container, BOUNDING_OPTIONS);
  const boundingSticky = useElementBounding(stickyElement, BOUNDING_OPTIONS);

  const stickyElementResolved = computed(() => toValue(stickyElement));
  const topOffsetCssVar = useCssVar(topOffsetVar, stickyElementResolved);
  const bottomOffsetCssVar = useCssVar(bottomOffsetVar, stickyElementResolved);

  const topSpacingResolved = computed(() => parseFloat(topOffsetCssVar.value ?? "0") || 0);
  const bottomSpacingResolved = computed(() => parseFloat(bottomOffsetCssVar.value ?? "0") || 0);

  const isEnabled = computed(() => toValue(enabled));

  function getScrollPosition(): number {
    const scrollEl = toValue(scrollContainer);

    if (scrollEl === globalThis.window) {
      return globalThis.window.pageYOffset || document.documentElement.scrollTop;
    }

    if (scrollEl instanceof HTMLElement) {
      return scrollEl.scrollTop;
    }

    return 0;
  }

  function updateDimensions() {
    const element = toValue(stickyElement);

    if (!element || !toValue(container)) {
      return;
    }

    dimensions.value.viewportHeight = globalThis.window.innerHeight;
    dimensions.value.viewportTop = getScrollPosition();

    dimensions.value.containerTop = boundingContainer.top.value + dimensions.value.viewportTop;
    dimensions.value.containerHeight = boundingContainer.height.value;

    dimensions.value.elementHeight = boundingSticky.height.value;
    dimensions.value.elementWidth = boundingSticky.width.value;

    dimensions.value.topSpacing = topSpacingResolved.value;
    dimensions.value.bottomSpacing = bottomSpacingResolved.value;
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
    const { containerTop, containerHeight, elementHeight, viewportHeight, viewportTop, topSpacing, bottomSpacing } =
      dims;

    const containerBottom = containerTop + containerHeight;
    const elementTop = boundingSticky.top.value + viewportTop;

    const isElementTallerThanViewport = elementHeight + topSpacing + bottomSpacing > viewportHeight;

    const isScrollingDown = viewportTop > dims.lastViewportTop;
    const isScrollingUp = viewportTop < dims.lastViewportTop;

    const affixType = getAffixType({
      isTaller: isElementTallerThanViewport,
      isScrollingDown,
      isScrollingUp,
      containerTop,
      containerBottom,
      viewportTop,
      viewportHeight,
      elementHeight,
      elementTop,
      topSpacing,
      bottomSpacing,
    });

    applyStyles(affixType, dims, elementTop, containerTop);

    isStuckTop.value = affixType === AFFIX_TYPES.FIXED_TOP;
    isStuckBottom.value = affixType === AFFIX_TYPES.FIXED_BOTTOM;
    isActive.value = affixType !== AFFIX_TYPES.STATIC;

    dims.lastViewportTop = viewportTop;
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
        translate.value = elementTop - containerTop;
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
        translate.value = elementTop - containerTop;
        break;
      }

      case AFFIX_TYPES.ABSOLUTE: {
        mode.value = "absolute";
        style.value = {
          ...baseStyle,
          position: "absolute",
          top: `${translate.value}px`,
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
        translate.value = bottomTop;
        break;
      }

      case AFFIX_TYPES.STATIC:
      default: {
        mode.value = "static";
        style.value = {
          position: "static",
        };
        translate.value = 0;
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
    translate.value = 0;
  }

  const update = useThrottleFn(calculatePosition, throttleDelay);
  const updateImmediate = calculatePosition;

  function attachListeners() {
    const scrollEl = toValue(scrollContainer);

    if (scrollEl === globalThis.window) {
      globalThis.window.addEventListener("scroll", update, { passive: true });
      globalThis.window.addEventListener("resize", update);
    } else if (scrollEl instanceof HTMLElement) {
      scrollEl.addEventListener("scroll", update, { passive: true });
    }
  }

  function detachListeners() {
    const scrollEl = toValue(scrollContainer);

    if (scrollEl === globalThis.window) {
      globalThis.window.removeEventListener("scroll", update);
      globalThis.window.removeEventListener("resize", update);
    } else if (scrollEl instanceof HTMLElement) {
      scrollEl.removeEventListener("scroll", update);
    }
  }

  function destroy() {
    detachListeners();
    resetPosition();
  }

  onMounted(() => {
    attachListeners();
    void update();
  });

  onBeforeUnmount(() => {
    destroy();
  });

  watch([boundingSticky.height, boundingContainer.height], updateImmediate);

  watch(isEnabled, (value) => {
    // eslint-disable-next-line sonarjs/no-selector-parameter
    if (value) {
      void update();
    } else {
      resetPosition();
    }
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
