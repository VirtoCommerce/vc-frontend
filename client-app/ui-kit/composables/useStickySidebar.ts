import { useElementBounding, useCssVar } from "@vueuse/core";
import throttle from "lodash/throttle";
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

  const { top: cTop, height: cHeight } = useElementBounding(content, BOUNDING_OPTIONS);
  const { height: fHeight, top: fTop } = useElementBounding(sidebar, BOUNDING_OPTIONS);

  const setSidebarPosition = throttle(_setSidebarPosition, 50);

  const maxOffsetTop = ref(0);
  const maxOffsetBottom = ref(0);

  function _setSidebarPosition() {
    const { clientHeight, scrollTop } = document.documentElement;

    const contentHeight = cHeight.value;
    const contentTop = cTop.value;
    const contentBottom = contentTop + contentHeight;

    const sidebarHeight = fHeight.value;
    const sidebarTop = fTop.value;
    const sidebarBottom = sidebarTop + sidebarHeight;

    const zoomCorrection = window.devicePixelRatio === 1 ? 0 : 1;

    const offsetTop = maxOffsetTop.value - zoomCorrection;
    const offsetBottom = maxOffsetBottom.value - zoomCorrection;

    let action = "BETWEEN";

    const up = scrollTop < scrollOld;

    if (sidebarHeight > clientHeight - offsetTop) {
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
    } else {
      sidebarStyle.value = {};
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
    { deep: true },
  );

  watch(
    () => cHeight.value,
    (value, oldValue) => {
      if (value !== oldValue) {
        setSidebarPosition();
      }
    },
    { deep: true },
  );

  return { setSidebarPosition, sidebarStyle, scrollDirection };
}
