<template>
  <fieldset
    ref="box"
    :class="[
      'vc-tab-switch-group',
      `vc-tab-switch-group--${variant}`,
      {
        'vc-tab-switch-group--fill': fill,
      },
    ]"
    :aria-label="ariaLabel"
  >
    <!-- A `fieldset`, which IS the group role natively, so no `role` attribute: every switch in the
         slot owns a radio input sharing one `name`, which makes this a set of form controls rather
         than a generic div. The comment sits INSIDE the element on purpose — a comment above the
         root turns the template into a fragment, and the root stops being the element. -->

    <!-- Before the switches, so it paints under them: both are positioned, and DOM order decides. -->
    <span ref="pill" class="vc-tab-switch-group__pill" aria-hidden="true" />

    <slot />
  </fieldset>
</template>

<script setup lang="ts">
import { useMediaQuery, useMutationObserver, useResizeObserver } from "@vueuse/core";
import { onMounted, shallowRef } from "vue";

interface IProps {
  variant?: "plain" | "filled" | "filled-strong" | "seg";
  fill?: boolean;
  ariaLabel?: string;
}

withDefaults(defineProps<IProps>(), {
  variant: "plain",
});

// The indicator does not jump: it stretches across both positions and gathers on the new one, so
// the eye follows WHERE the choice went instead of watching one fill die and another light up.
const SPREAD_OFFSET = 0.42;
const DURATION = 520;
const EASING = "cubic-bezier(0.34, 0.86, 0.22, 1)";

const box = shallowRef<HTMLElement | null>(null);
const pill = shallowRef<HTMLElement | null>(null);
const previous = shallowRef<{ left: number; width: number } | null>(null);
let awaitingViewTransition = false;
// The travel is filled forwards, and a filled animation outranks the inline styles written below
// it. Held so it can be taken back the moment those styles change, or the finished fill would keep
// answering for `left`/`width` after the indicator has been told to be somewhere else.
let travel: Animation | null = null;

const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

// Read from the DOM rather than from a model: the group wraps whatever switches the consumer lays
// out, and the checked one is the only thing it needs to know.
function movePill() {
  const boxElement = box.value;
  const pillElement = pill.value;

  if (!boxElement || !pillElement) {
    return;
  }

  const active = boxElement.querySelector(".vc-tab-switch--checked");

  if (!active) {
    // Nothing is checked, so the last travel has nothing left to describe: dropped here rather than
    // only on the next move, because `previous` goes with it and the next move will therefore take
    // the first-paint path, which does not animate and would have left the old fill in charge.
    travel?.cancel();
    travel = null;
    pillElement.style.opacity = "0";
    previous.value = null;
    return;
  }

  const boxRect = boxElement.getBoundingClientRect();

  // Not laid out yet — a measurement now would place the indicator at zero and animate from there.
  if (!boxRect.width) {
    return;
  }

  // A view transition paints snapshots of the page over the live document for its whole duration,
  // and one of them is a still image. An indicator travelling underneath it is simply not there
  // to be seen: measured on the colour-mode switch, whose reveal is 620ms against this 520ms, and
  // whose circle closes ONTO the control that was pressed — so the segment that just changed is
  // the last pixel uncovered, and the move is over by then. Going the other way the same circle
  // opens out of that control, the live layer is on top, and the move shows, which is exactly the
  // asymmetry this looks for.
  //
  // No app class is read for it: the transition's own pseudo-elements carry running animations,
  // and those are visible through the standard `getAnimations()`. Holding the whole move,
  // position included, is what lets the replay animate from where the indicator still visibly is.
  const transition =
    typeof document.getAnimations === "function"
      ? document.getAnimations().find((animation) => {
          const pseudo = (animation.effect as KeyframeEffect | null)?.pseudoElement;

          return (
            typeof pseudo === "string" && pseudo.startsWith("::view-transition") && animation.playState === "running"
          );
        })
      : undefined;

  if (transition) {
    if (!awaitingViewTransition) {
      awaitingViewTransition = true;
      void transition.finished
        .catch(() => {})
        .finally(() => {
          awaitingViewTransition = false;
          movePill();
        });
    }

    return;
  }

  // Undo any ancestor scale before reading the geometry. A popover plays its panel in with
  // `scale(.97)`, and this group is measured the moment that panel stops being display:none —
  // mid-flight. getBoundingClientRect reports the SCALED box, so the indicator is placed for a
  // panel 3% smaller than the one it ends up in: measured on the preferences panel, left came
  // out 199.55 where the settled segment is at 206.0, and the width 97.84 against 101.0 — the
  // indicator lands a few pixels left of its segment and stays there. offsetWidth is the layout
  // width and ignores transforms, so their ratio is the scale in force.
  //
  // Only applied when it is clearly a transform: offsetWidth is rounded to an integer, so at
  // rest the two differ by up to half a pixel and correcting by that would ADD error.
  const layoutWidth = boxElement.offsetWidth;
  const scale = layoutWidth > 0 ? boxRect.width / layoutWidth : 1;
  const correction = Math.abs(1 - scale) > 0.01 ? scale : 1;

  const activeRect = active.getBoundingClientRect();
  // Physical offsets on purpose: these are measured geometry, not authored direction, and the
  // measurement already accounts for RTL.
  //
  // Unrounded. An integer number of CSS pixels is only a whole device pixel at 100% zoom on a
  // 1x screen; at any other zoom it lands mid-pixel, and the indicator's 1px inset rings smear
  // across two columns of them. Measured at 100% on a 2x screen, rounding alone already put the
  // right edge 0.45px inside the next segment. The browser snaps to the device grid itself, and
  // does it correctly at every zoom.
  // Minus the box's own border. `left` is set on an absolutely positioned pill, so the browser
  // lays it out from the box's PADDING edge, while getBoundingClientRect measures from its BORDER
  // edge — and the seg variant draws a 1px rim. The two origins differ by exactly that rim, so the
  // pill sat a whole pixel right of its segment everywhere the rim is kept: measured on the
  // preferences panel, the pill's left edge at 922.99 against the segment's 921.86. The catalog's
  // own groups read 0.00 because they strip the rim with `border-0`, which is what hid this.
  const left = (activeRect.left - boxRect.left) / correction - boxElement.clientLeft;
  const width = activeRect.width / correction;
  const from = previous.value;

  // A redraw that was not about the tabs.
  if (from && from.left === left && from.width === width) {
    return;
  }

  travel?.cancel();
  previous.value = { left, width };
  pillElement.style.opacity = "1";
  pillElement.style.left = `${left}px`;
  pillElement.style.width = `${width}px`;

  // First paint has nowhere to travel from; jsdom and older browsers have no Web Animations.
  if (!from || reducedMotion.value || typeof pillElement.animate !== "function") {
    return;
  }

  const nearEdge = Math.min(from.left, left);
  const farEdge = Math.max(from.left + from.width, left + width);

  travel = pillElement.animate(
    [
      { left: `${from.left}px`, width: `${from.width}px` },
      { left: `${nearEdge}px`, width: `${farEdge - nearEdge}px`, offset: SPREAD_OFFSET },
      { left: `${left}px`, width: `${width}px` },
    ],
    { duration: DURATION, easing: EASING, fill: "forwards" },
  );
}

onMounted(movePill);

// The switches own the state, so the class landing on one of them is the signal.
useMutationObserver(box, movePill, { attributes: true, attributeFilter: ["class"], subtree: true });
// A group inside a popover is mounted long before anyone sees it and measures zero then; the box it
// gains when the panel stops being display:none is a resize, and that is what places the indicator
// the first time. Measured: with this observer alone the first open lands correctly.
useResizeObserver(box, movePill);
</script>

<style lang="scss">
.vc-tab-switch-group {
  $seg: "";

  // Every variant redeclares the internals it needs with its own default, and each default still
  // reads the public knob first — so a consumer can retune a variant without fighting it.
  --gap: var(--vc-tab-switch-group-gap, theme("padding.1"));
  --padding: var(--vc-tab-switch-group-padding, 0px);
  --radius: var(--vc-tab-switch-group-radius, var(--vc-radius, 0.5rem));
  --track-color: var(--vc-tab-switch-group-track-color, transparent);
  --track-border-color: var(--vc-tab-switch-group-track-border-color, transparent);
  --pill-color: var(--vc-tab-switch-group-pill-color, theme("colors.additional.50"));
  --pill-shadow: var(--vc-tab-switch-group-pill-shadow, theme("boxShadow.md"));

  @apply relative flex flex-wrap items-stretch;

  // The UA's own fieldset styling, undone. `border` and `padding` are restated below anyway; these
  // two are not, and `min-inline-size: min-content` is the one that matters — it stops the track
  // shrinking inside a flex or grid parent, which is every place this is used.
  margin: 0;
  min-inline-size: 0;

  gap: var(--gap);
  padding: var(--padding);
  border: 1px solid var(--track-border-color);
  border-radius: var(--radius);
  background: var(--track-color);

  // Equal columns: a five-tab sort row should not shuffle its widths as the labels change.
  &--fill {
    @apply grid w-full auto-cols-fr grid-flow-col;
  }

  &--filled,
  &--filled-strong {
    --padding: var(--vc-tab-switch-group-padding, theme("padding.1"));
    --vc-tab-switch-radius: calc(var(--radius) - var(--padding));
    --vc-tab-switch-border-color: transparent;
    --vc-tab-switch-checked-border-color: transparent;
  }

  &--filled {
    --track-color: var(--vc-tab-switch-group-track-color, theme("colors.neutral.50"));
    --track-border-color: var(--vc-tab-switch-group-track-border-color, theme("colors.neutral.200"));
  }

  &--filled-strong {
    --track-color: var(--vc-tab-switch-group-track-color, theme("colors.neutral.100"));
  }

  // The segmented rail: one indicator slides between the options, so the checked switch keeps its
  // ink and its shadow and hands the fill over to the indicator.
  &--seg {
    $seg: &;

    --gap: var(--vc-tab-switch-group-gap, 0px);
    --padding: var(--vc-tab-switch-group-padding, 3px);
    --radius: var(--vc-tab-switch-group-radius, theme("borderRadius.full"));
    --track-color: var(
      --vc-tab-switch-group-track-color,
      color-mix(in srgb, theme("colors.neutral.950") 5%, transparent)
    );

    --vc-tab-switch-radius: theme("borderRadius.full");
    --vc-tab-switch-padding-x: theme("padding[3.5]");
    --vc-tab-switch-border-color: transparent;
    --vc-tab-switch-checked-border-color: transparent;
    // The fill belongs to the indicator. Left on the switch it would light a second plate at the
    // far end of the travel, and the movement would be lost between the two.
    --vc-tab-switch-checked-bg-color: transparent;
    --vc-tab-switch-text-color: theme("colors.neutral.600");
    --vc-tab-switch-font-weight: theme("fontWeight.normal");
    --vc-tab-switch-checked-font-weight: theme("fontWeight.semibold");
    --vc-tab-switch-hover-color: theme("colors.neutral.950");
    // The checked segment's icon is not an accent here — the text leads.
    --vc-tab-switch-color: currentColor;

    @apply max-w-full flex-nowrap;
  }

  &__pill {
    // Only the segmented rail has an indicator; elsewhere the switch shows its own state.
    @apply hidden;

    #{$seg} & {
      @apply pointer-events-none absolute z-0 block opacity-0;

      inset-block: var(--padding);
      // Physical, because JS writes measured geometry here — the measurement is already RTL-aware.
      left: 0;
      width: 0;
      border-radius: var(--vc-tab-switch-group-pill-radius, theme("borderRadius.full"));
      background: var(--pill-color);
      box-shadow: var(--pill-shadow);
    }
  }
}
</style>
