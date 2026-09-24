import { useMediaQuery } from "@vueuse/core";
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import type { Ref } from "vue";

/** The design's entry curve, shared by the rise and the crossfade before it. */
const EASING = "cubic-bezier(0.22, 0.9, 0.28, 1)";

const FADE_DURATION = 130;

/** The split-flap: a card turns away, changes, and turns back. */
const FLIP_OUT_DURATION = 105;
const FLIP_IN_DURATION = 125;
const FLIP_STAGGER = 55;
/** How long cards abandoned mid-turn take to come back level before a new wave starts. */
const FLIP_RECOVER_DURATION = 90;
const FLIP_OUT_EASING = "cubic-bezier(0.4, 0, 0.85, 0.5)";
/**
 * The depth each card is seen through. It belongs in the card's own transform, not on the grid as a
 * `perspective` property: that gives every card one shared vanishing point at the grid's centre, so
 * a card in an outer column turns as though watched from the side instead of about its own axis.
 */
const FLIP_DEPTH = "perspective(1200px)";
const FLIP_IN_EASING = "cubic-bezier(0.15, 0.9, 0.3, 1)";

const RISE_DURATION = 420;
const RISE_STAGGER = 40;
/** Past this many cards the wave stops deepening, or the last row of a full page enters a second late. */
const RISE_STAGGER_CAP = 12;

/** Set on the grid for the length of a flip, so it can hold the depth the turn is seen through. */
export const FLIPPING_CLASS = "category-products__list--flipping";

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
function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function useCatalogGridMotion(grid: Ref<HTMLElement | null>, viewMode: Ref<"grid" | "list">) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  /** What the grid is actually rendering, which trails `viewMode` for the length of the fade. */
  const displayedViewMode = ref(viewMode.value);

  let fade: Animation | undefined;
  /** Bumped by every wave, so a card still turning for an older one knows to stop. */
  let flipGeneration = 0;

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
    flipGeneration += 1;
    fade?.cancel();
    fade = undefined;

    // `subtree`, because the cards carry the animations that strand them. A card whose wave was
    // superseded stops where it stood — edge-on, at 90 degrees — and its turn is filled forwards, so
    // it keeps answering for `transform` after everything else has moved on. The rise that follows
    // fills BACKWARDS: it covers the card while it runs and lets the old turn take the transform
    // back the moment it ends, which is a card that fades in and then vanishes. Switching grid/list
    // mid-wave is the way there, because that path calls `enter` and never `recover`.
    grid.value?.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());

    if (grid.value) {
      grid.value.style.opacity = "";
      grid.value.style.filter = "";
      // Cancelling gives the cards their inline transform back, and `recover` leaves one behind.
      Array.from(grid.value.children).forEach((card) => {
        (card as HTMLElement).style.transform = "";
      });
      // A superseded wave returns without taking its own class off; nothing else ever does.
      grid.value.classList.remove(FLIPPING_CLASS);
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

  function turn(card: HTMLElement, from: string, to: string, duration: number, easing: string) {
    const animation = card.animate([{ transform: from }, { transform: to }], {
      duration,
      easing,
      fill: "forwards",
    });

    return settled(animation, duration);
  }

  /**
   * Brings cards left mid-turn by an abandoned wave back to facing the reader, all together and
   * without the wave's stagger. Cancelling their animations outright would snap a card from the
   * angle it had reached straight to none in a single frame; starting the new wave from that angle
   * instead would leave a card standing askew until its turn came round, up to eight hundred
   * milliseconds later. Neither reads as movement.
   */
  async function recover(cards: HTMLElement[], axis: string) {
    // Read every card before writing to any of them, so the measurement costs one layout, not one
    // per card.
    const current = cards.map((card) => getComputedStyle(card).transform);

    if (current.every((transform) => transform === "none")) {
      return;
    }

    await Promise.all(
      cards.map((card, index) => {
        card.getAnimations().forEach((animation) => animation.cancel());
        card.style.transform = current[index] === "none" ? "" : current[index];

        return turn(
          card,
          current[index] === "none" ? `${FLIP_DEPTH} ${axis}(0deg)` : current[index],
          `${FLIP_DEPTH} ${axis}(0deg)`,
          FLIP_RECOVER_DURATION,
          FLIP_IN_EASING,
        );
      }),
    );
  }

  /**
   * One card's turn: away, changed at the edge, and back. Changing it here rather than changing the
   * whole grid at once is the point — a single update would change the cards still facing the reader.
   */
  async function flipCard(
    card: HTMLElement,
    index: number,
    axis: string,
    generation: number,
    swapAt: (index: number) => void,
  ) {
    const superseded = () => generation !== flipGeneration;

    await wait(index * FLIP_STAGGER);

    if (superseded()) {
      return;
    }

    await turn(
      card,
      `${FLIP_DEPTH} ${axis}(0deg)`,
      `${FLIP_DEPTH} ${axis}(-90deg)`,
      FLIP_OUT_DURATION,
      FLIP_OUT_EASING,
    );

    if (superseded()) {
      return;
    }

    swapAt(index);
    await nextTick();

    await turn(card, `${FLIP_DEPTH} ${axis}(90deg)`, `${FLIP_DEPTH} ${axis}(0deg)`, FLIP_IN_DURATION, FLIP_IN_EASING);

    if (!superseded()) {
      card.style.transform = "none";
    }
  }

  /**
   * Turns every card on its own axis and changes what it holds at the edge, as a wave down the grid.
   * The axis follows the layout — a tile turns on the vertical, a row on the horizontal — because
   * turning a shape across its long side reads as the shape breaking rather than flipping.
   *
   * @param swapAt  Called with a card's index the moment that card stands edge-on.
   * @returns whether the wave ran. When it did not, the caller still has to show the new result.
   */
  async function flip(swapAt: (index: number) => void) {
    const element = grid.value;

    if (!canAnimate(element)) {
      return false;
    }

    const cards = Array.from(element.children) as HTMLElement[];

    if (!cards.length) {
      return false;
    }

    // A second sorting arriving mid-wave takes the grid over rather than being dropped: the cards
    // still turning for the previous order are answering a question nobody is asking any more.
    const generation = ++flipGeneration;
    const axis = displayedViewMode.value === "list" ? "rotateX" : "rotateY";

    element.classList.add(FLIPPING_CLASS);
    await recover(cards, axis);

    if (generation !== flipGeneration) {
      return true;
    }

    await Promise.all(cards.map((card, index) => flipCard(card, index, axis, generation, swapAt)));

    if (generation !== flipGeneration) {
      return true;
    }

    element.classList.remove(FLIPPING_CLASS);

    return true;
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

  return { displayedViewMode, enter, flip };
}
