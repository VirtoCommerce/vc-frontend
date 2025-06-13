import { useElementBounding, useCssVar } from "@vueuse/core";
import trottle from "lodash/throttle";
import { onBeforeUnmount, onMounted, ref, unref, watch } from "vue";
import type { StyleValue, Ref } from "vue";

const BOUNDING_OPTIONS = { windowResize: true, immediate: true };
type PropsType = {
  content: Ref<HTMLElement | null>;
  sidebar: Ref<HTMLElement | null>;
};

export function useStickySidebar({ content, sidebar }: PropsType) {
  let scrollOld = 0;

  const sidebarStyle = ref<StyleValue | undefined>();
  const scrollDirection = ref<"UP" | "DOWN" | null>(null);

  const { top: _contentTop, height: _contentHeight } = useElementBounding(content, BOUNDING_OPTIONS);
  const { height: _sidebarHeight, top: _sidebarTop } = useElementBounding(sidebar, BOUNDING_OPTIONS);

  const setSidebarPosition = trottle(_setSidebarPosition, 50);

  const maxOffsetTop = ref(0);
  const maxOffsetBottom = ref(0);

  function _setSidebarPosition() {
    const { clientHeight, scrollTop } = document.documentElement;

    const contentTop = _contentTop.value;
    const contentHeight = _contentHeight.value;
    const sidebarTop = _sidebarTop.value;
    const sidebarHeight = _sidebarHeight.value;
    const contentBottom = contentTop + contentHeight;
    const sidebarBottom = sidebarTop + sidebarHeight;

    const offsetTop = maxOffsetTop.value;
    const offsetBottom = maxOffsetBottom.value;

    if (sidebarHeight <= clientHeight - offsetTop) {
      sidebarStyle.value = {};
      scrollOld = scrollTop;
      return;
    }

    const up = scrollTop < scrollOld;

    const reachedTop = sidebarTop <= contentTop - offsetTop;
    const reachedBottom = sidebarBottom >= contentBottom + offsetBottom;

    let action: "TOP" | "BOTTOM" | "BETWEEN" = "BETWEEN";

    if (reachedTop) {
      action = "TOP";
    } else if (reachedBottom) {
      action = "BOTTOM";
    } else if (sidebarHeight > clientHeight) {
      if (up && sidebarTop >= offsetTop && sidebarBottom >= clientHeight - offsetBottom && sidebarTop > contentTop) {
        action = "TOP";
      } else if (
        (!up &&
          sidebarTop <= offsetTop &&
          sidebarBottom <= clientHeight - offsetBottom &&
          sidebarBottom <= contentBottom) ||
        sidebarTop > contentBottom
      ) {
        action = "BOTTOM";
      }
    }

    switch (action) {
      case "BOTTOM":
        sidebarStyle.value = {
          placeSelf: "flex-end",
          position: "sticky",
          top: "auto",
        };
        break;
      case "BETWEEN":
        sidebarStyle.value = {
          position: "relative",
          marginTop: `${sidebarTop - contentTop}px`,
          top: "auto",
          bottom: "auto",
        };
        break;
      default:
        sidebarStyle.value = {
          position: "sticky",
          bottom: "auto",
        };
    }

    scrollOld = scrollTop;
  }

  onMounted(() => {
    const _maxOffsetTop = unref(useCssVar("--sidebar-offset-top", sidebar)) ?? "0";
    const _maxOffsetBottom = unref(useCssVar("--sidebar-offset-bottom", sidebar)) ?? "0";

    const re = /\d+/;

    maxOffsetTop.value = Number(re.exec(_maxOffsetTop)?.[0]);
    maxOffsetBottom.value = Number(re.exec(_maxOffsetBottom)?.[0]);

    window.addEventListener("scroll", setSidebarPosition);

    setSidebarPosition();
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", setSidebarPosition);
  });

  watch(
    () => _sidebarHeight.value,
    (value, oldValue) => {
      if (value !== oldValue) {
        setSidebarPosition();
      }
    },
    { deep: true },
  );

  watch(
    () => _contentHeight.value,
    (value, oldValue) => {
      if (value !== oldValue) {
        setSidebarPosition();
      }
    },
    { deep: true },
  );

  return { setSidebarPosition, sidebarStyle, scrollDirection };
}
