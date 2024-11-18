import { useElementBounding } from "@vueuse/core";
import throttle from "lodash/throttle";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { ShallowRef, StyleValue } from "vue";

const BOUNDING_OPTIONS = { windowResize: true, immediate: true };
type PropsType = {
  content: Readonly<ShallowRef>;
  sidebar: Readonly<ShallowRef>;
};

export function useStickySidebar({ content, sidebar }: PropsType) {
  let scrollOld = 0;
  const maxOffsetTop = 108;
  const maxOffsetBottom = 20;

  const sidebarStyle = ref<StyleValue | undefined>();
  const scrollDirection = ref<"UP" | "DOWN" | null>(null);

  const { top: cTop, height: cHeight } = useElementBounding(content, BOUNDING_OPTIONS);
  const { height: fHeight, top: fTop } = useElementBounding(sidebar, BOUNDING_OPTIONS);

  const setSidebarPosition = throttle(_setSidebarPosition, 50);

  function _setSidebarPosition() {
    const { clientHeight, scrollTop } = document.documentElement;

    const contentHeight = cHeight.value;
    const contentTop = cTop.value;
    const contentBottom = contentTop + contentHeight;

    const sidebarHeight = fHeight.value;
    const sidebarTop = fTop.value;
    const sidebarBottom = sidebarTop + sidebarHeight;

    const zoomCorrection = window.devicePixelRatio === 1 ? 0 : 1;

    const offsetTop = maxOffsetTop - zoomCorrection;
    const offsetBottom = maxOffsetBottom - zoomCorrection;

    let action = "BETWEEN";

    const down = scrollTop > scrollOld;
    const up = scrollTop < scrollOld;

    if (sidebarHeight > clientHeight - offsetTop && (down || !up)) {
      if (
        (sidebarTop <= offsetTop && sidebarBottom <= clientHeight - offsetBottom && sidebarBottom <= contentBottom) ||
        contentBottom < clientHeight
      ) {
        action = "BOTTOM";
      }
    } else if (
      up &&
      sidebarTop >= offsetTop &&
      sidebarBottom >= clientHeight - offsetBottom &&
      sidebarTop > contentTop
    ) {
      action = "TOP";
    }

    switch (action) {
      case "BOTTOM":
        sidebarStyle.value = {
          placeSelf: "flex-end",
          position: "sticky",
          bottom: `${maxOffsetBottom}px`,
        };

        break;
      case "BETWEEN":
        sidebarStyle.value = {
          position: "relative",
          marginTop: `${sidebarTop - contentTop}px`,
        };

        break;
      default:
        sidebarStyle.value = {
          position: "sticky",
          top: `${maxOffsetTop}px`,
        };
    }

    scrollOld = scrollTop;
  }

  onMounted(() => {
    window.addEventListener("scroll", setSidebarPosition);
    window.addEventListener("resize", setSidebarPosition);
    setSidebarPosition();
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", setSidebarPosition);
    window.removeEventListener("resize", setSidebarPosition);
  });

  watch(
    () => fHeight.value,
    (value, oldValue) => {
      if (value !== oldValue) {
        setSidebarPosition();
      }
    },
  );

  watch(
    () => cHeight.value,
    (value, oldValue) => {
      if (value !== oldValue) {
        setSidebarPosition();
      }
    },
  );

  return { setSidebarPosition, sidebarStyle, scrollDirection };
}
