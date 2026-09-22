import { useMediaQuery } from "@vueuse/core";
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import type { Ref } from "vue";

/** The design's entry curve, shared by the rise and the crossfade before it. */
const EASING = "cubic-bezier(0.22, 0.9, 0.28, 1)";

const FADE_DURATION = 130;
const RISE_DURATION = 420;
const RISE_STAGGER = 40;
/** Past this many cards the wave stops deepening, or the last row of a full page enters a second late. */
const RISE_STAGGER_CAP = 12;

/**
 * Moves the products grid when what it shows changes.
 *
 * Two events, two animations. Switching the layout changes the shape of every card, so the grid
 * dims and the new shape rises in its place. A new result set — a sort, a filter, a page — has no
 * old cards left to relate to by the time it lands, so it only rises.
 *
 * @param grid  The element whose children are the cards.
 * @param viewMode  The layout the owner has chosen. The grid follows it a beat late, so the change
 *   lands behind the dimming rather than under the reader's eye.
 */
export function useCatalogGridMotion(grid: Ref<HTMLElement | null>, viewMode: Ref<"grid" | "list">) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  /** What the grid is actually rendering, which trails `viewMode` for the length of the fade. */
  const displayedViewMode = ref(viewMode.value);

  let fade: Animation | undefined;

  function canAnimate(element: HTMLElement | null): element is HTMLElement {
    return !!element && !reducedMotion.value && typeof element.animate === "function";
  }

  /**
   * A filled animation outlives the frame it finished on and beats an inline style, so clearing
   * `style.opacity` does not bring a faded grid back — the animation itself has to go. The grid
   * element survives a layout change (measured: same node before and after), which is exactly when
   * a left-over fade would strand it at zero.
   */
  function clearAnimations() {
    fade?.cancel();
    fade = undefined;
    grid.value?.getAnimations().forEach((animation) => animation.cancel());

    if (grid.value) {
      grid.value.style.opacity = "";
      grid.value.style.filter = "";
    }
  }

  /**
   * A background tab freezes the document timeline: the animation still reports `running`, its
   * `currentTime` never moves, and `finished` never settles. Whatever waits on it has to be able to
   * give up on its own.
   */
  function settled(animation: Animation, duration: number): Promise<void> {
    return Promise.race([
      animation.finished.then(() => undefined).catch(() => undefined),
      new Promise<void>((resolve) => setTimeout(resolve, duration + 240)),
    ]);
  }

  function riseIn() {
    const element = grid.value;

    if (!canAnimate(element)) {
      return;
    }

    Array.from(element.children).forEach((card, index) => {
      card.animate(
        [
          { opacity: 0, transform: "translateY(14px)", filter: "blur(6px)" },
          { opacity: 1, transform: "none", filter: "blur(0)" },
        ],
        {
          duration: RISE_DURATION,
          delay: Math.min(index, RISE_STAGGER_CAP) * RISE_STAGGER,
          easing: EASING,
          fill: "backwards",
        },
      );
    });
  }

  /** Call when a new result set has finished loading and the cards are in the DOM. */
  async function enter() {
    await nextTick();
    clearAnimations();
    riseIn();
  }

  watch(viewMode, async (next) => {
    const element = grid.value;

    if (!canAnimate(element)) {
      displayedViewMode.value = next;
      return;
    }

    fade?.cancel();
    fade = element.animate(
      [
        { opacity: 1, filter: "blur(0)" },
        { opacity: 0, filter: "blur(6px)" },
      ],
      {
        duration: FADE_DURATION,
        easing: EASING,
        fill: "forwards",
      },
    );

    await settled(fade, FADE_DURATION);

    displayedViewMode.value = next;
    await enter();
  });

  onBeforeUnmount(clearAnimations);

  return { displayedViewMode, enter };
}
