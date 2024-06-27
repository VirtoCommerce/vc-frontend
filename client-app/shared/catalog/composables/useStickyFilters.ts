import { useElementBounding } from "@vueuse/core";
import throttle from "lodash/throttle";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { Ref, StyleValue } from "vue";

const BOUNDING_OPTIONS = { windowResize: false, immediate: false };
type PropsType = {
  areHorizontalFilters: Ref<boolean>;
};

export function useStickyFilters({ areHorizontalFilters }: PropsType) {
  let scrollOld = 0;
  const maxOffsetTop = 108;
  const maxOffsetBottom = 20;

  const contentElement = ref<HTMLElement | null>(null);
  const filtersElement = ref<HTMLElement | null>(null);
  const filtersStyle = ref<StyleValue | undefined>();

  const { top: cTop, height: cHeight } = useElementBounding(contentElement, BOUNDING_OPTIONS);
  const { height: fHeight, top: fTop } = useElementBounding(filtersElement, BOUNDING_OPTIONS);

  const setFiltersPosition = throttle(_setFiltersPosition, 100);

  function _setFiltersPosition() {
    if (areHorizontalFilters.value) {
      return;
    }
    const { clientHeight, scrollTop } = document.documentElement || document.body.scrollTop;

    const scrollBottom = scrollTop + clientHeight;

    const contentHeight = cHeight.value;
    const contentTop = scrollTop + cTop.value;
    const contentBottom = contentTop + contentHeight;

    const filterHeight = fHeight.value;
    const filterTop = scrollTop + fTop.value;
    const filterBottom = filterTop + filterHeight;

    const down = scrollTop > scrollOld;
    const up = scrollTop < scrollOld;

    const zoomCorrection = window.devicePixelRatio === 1 ? 0 : 1;

    const offsetTop = maxOffsetTop - zoomCorrection;
    const offsetBottom = maxOffsetBottom - zoomCorrection;

    let action = "BETWEEN";

    if (
      (up && scrollTop <= filterTop - offsetTop) ||
      filterHeight <= clientHeight - offsetTop ||
      filterHeight >= contentHeight ||
      contentTop > filterTop
    ) {
      action = "TOP";
    } else if (
      (down && scrollBottom >= filterBottom + offsetBottom && scrollBottom <= contentBottom + offsetBottom) ||
      (scrollBottom >= contentBottom + offsetBottom && filterBottom < contentBottom) ||
      (!up && scrollBottom > filterBottom + offsetBottom && filterBottom < contentBottom) ||
      filterBottom > contentBottom
    ) {
      action = "BOTTOM";
    }

    switch (action) {
      case "BOTTOM":
        filtersStyle.value = {
          alignSelf: "flex-end",
          bottom: `${maxOffsetBottom}px`,
        };

        break;
      case "BETWEEN":
        filtersStyle.value = {
          marginTop: `${filterTop - contentTop}px`,
        };
        break;
      default:
        filtersStyle.value = {
          top: `${maxOffsetTop}px`,
        };
    }

    scrollOld = scrollTop;
  }

  onMounted(() => {
    window.addEventListener("scroll", setFiltersPosition);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", setFiltersPosition);
  });

  watch(
    () => fHeight.value,
    (value, oldValue) => {
      if (value !== oldValue) {
        setFiltersPosition();
      }
    },
  );

  watch(
    () => cHeight.value,
    (value, oldValue) => {
      if (value !== oldValue) {
        setFiltersPosition();
      }
    },
  );

  return { setFiltersPosition, filtersStyle };
}
