import { useCssVar, useElementBounding, useThrottleFn } from "@vueuse/core";
import { computed, onBeforeUnmount, onMounted, ref, toValue, watch } from "vue";
import type { CSSProperties, MaybeRefOrGetter } from "vue";

const AFFIX_TYPES = {
  FIXED_TOP: "FIXED_TOP",
  FIXED_BOTTOM: "FIXED_BOTTOM",
  ABSOLUTE: "ABSOLUTE",
  STATIC_BOTTOM: "STATIC_BOTTOM",
  STATIC: "STATIC",
} as const;

type AffixType = (typeof AFFIX_TYPES)[keyof typeof AFFIX_TYPES];

const DEFAULT_TOP_OFFSET_VAR = "--sticky-offset-top";
const DEFAULT_BOTTOM_OFFSET_VAR = "--sticky-offset-bottom";
const DEFAULT_THROTTLE_DELAY = 50;

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
    topOffsetVar = DEFAULT_TOP_OFFSET_VAR,
    bottomOffsetVar = DEFAULT_BOTTOM_OFFSET_VAR,
    enabled = true,
    scrollContainer = globalThis.window,
  } = options;

  const style = ref<CSSProperties>({});
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

  const containerBounding = useElementBounding(container, BOUNDING_OPTIONS);
  const elementBounding = useElementBounding(stickyElement, BOUNDING_OPTIONS);

  const stickyElementResolved = computed(() => toValue(stickyElement));
  const topOffsetCssVar = useCssVar(topOffsetVar, stickyElementResolved);
  const bottomOffsetCssVar = useCssVar(bottomOffsetVar, stickyElementResolved);

  const topSpacingResolved = computed(() => Number.parseFloat(topOffsetCssVar.value ?? "0") || 0);
  const bottomSpacingResolved = computed(() => Number.parseFloat(bottomOffsetCssVar.value ?? "0") || 0);

  const isEnabled = computed(() => toValue(enabled));

  function getScrollPosition(): number {
    const scrollEl = toValue(scrollContainer);

    if (scrollEl === globalThis.window) {
      return globalThis.window.scrollY || document.documentElement.scrollTop;
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

    dimensions.value.containerTop = containerBounding.top.value + dimensions.value.viewportTop;
    dimensions.value.containerHeight = containerBounding.height.value;

    dimensions.value.elementHeight = elementBounding.height.value;
    dimensions.value.elementWidth = elementBounding.width.value;

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
    const elementTop = elementBounding.top.value + viewportTop;

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

    const baseStyle: CSSProperties = {
      left: "auto",
      right: "auto",
      width: `${dims.elementWidth}px`,
    };

    const stickyTopStyle: CSSProperties = {
      ...baseStyle,
      position: "sticky",
      top: `${dims.topSpacing}px`,
      bottom: "auto",
    };

    const stickyBottomStyle: CSSProperties = {
      ...baseStyle,
      position: "sticky",
      top: "auto",
      bottom: `${dims.bottomSpacing}px`,
      alignSelf: "flex-end",
    };

    const absoluteStyle: CSSProperties = {
      ...baseStyle,
      position: "absolute",
      top: `${translate.value}px`,
      bottom: "auto",
    };

    switch (affixType) {
      case AFFIX_TYPES.FIXED_TOP: {
        style.value = stickyTopStyle;
        translate.value = elementTop - containerTop;
        break;
      }

      case AFFIX_TYPES.STATIC: {
        style.value = stickyTopStyle;
        translate.value = 0;
        break;
      }

      case AFFIX_TYPES.FIXED_BOTTOM: {
        style.value = stickyBottomStyle;
        translate.value = elementTop - containerTop;
        break;
      }

      case AFFIX_TYPES.STATIC_BOTTOM: {
        style.value = stickyBottomStyle;
        translate.value = dims.containerHeight - dims.elementHeight;
        break;
      }

      case AFFIX_TYPES.ABSOLUTE: {
        style.value = absoluteStyle;
        break;
      }
    }
  }

  function resetPosition() {
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

  watch([elementBounding.height, containerBounding.height], updateImmediate);

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
    isActive,
    isStuckTop,
    isStuckBottom,
    update,
    destroy,
  };
}
