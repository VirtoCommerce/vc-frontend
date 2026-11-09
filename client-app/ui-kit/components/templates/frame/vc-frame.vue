<template>
  <div class="vc-frame">
    <!-- No wrapper: each header root is a child of this tall box, so a sticky one sticks for the whole page. -->
    <slot name="header" />

    <main id="main-content" class="vc-frame__main">
      <slot />
    </main>

    <div v-if="hasContent($slots.footer?.())" class="vc-frame__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Comment, Fragment, inject, provide, Text } from "vue";
import { vcFrameKey } from "./vc-frame-context";
import type { VNode } from "vue";

defineSlots<{
  /**
   * The page header. Rendered with no wrapper: each root element of this slot is a direct child of the frame, so a
   * `position: sticky` piece sticks for the whole page. Wrapping the pieces in one block element kills sticky.
   */
  header?: () => VNode[];
  /** The page content, inside the frame's `<main id="main-content">`, the skip-to-content target. */
  default?: () => VNode[];
  /** The page footer, inside the frame's footer element. A slot that renders nothing gets no element. */
  footer?: () => VNode[];
}>();

if (import.meta.env.DEV && inject(vcFrameKey, false)) {
  // eslint-disable-next-line no-console
  console.warn(
    'VcFrame: rendered inside another VcFrame. A page has one frame: one <main id="main-content">, one header and footer.',
  );
}

provide(vcFrameKey, true);

function hasContent(nodes: VNode[] | undefined): boolean {
  return (nodes ?? []).some((node) => {
    if (node.type === Comment) {
      return false;
    }

    if (node.type === Fragment) {
      return hasContent(node.children as VNode[]);
    }

    if (node.type === Text) {
      return String(node.children).trim() !== "";
    }

    return true;
  });
}
</script>

<style lang="scss">
// The page frame. A design sets the `--vc-frame-*` tokens on html (assets/styles/README.md, "Page frame");
// classic sets none, so the page looks as without the frame.
.vc-frame {
  // A container token set above the frame (a fork's `:root`, a design) keeps priority: copied before `__main` maps it.
  --inherited-container-px: var(--vc-container-px);
  --inherited-container-max-width: var(--vc-container-max-width);
  --inherited-container-pt: var(--vc-container-pt);
  --inherited-container-pb: var(--vc-container-pb);

  @apply flex min-h-screen flex-col;

  // Paper gets the classic frame in every design.
  @media print {
    --vc-frame-padding-x: initial;
    --vc-frame-max-width: initial;
    --vc-frame-gap: initial;
    --vc-frame-main-offset-top: initial;
    --vc-frame-main-offset-bottom: initial;
  }

  &__main {
    // Every VcContainer in the page takes the frame's side space and column, and leaves the space above and below
    // the page to the frame: `calc(<offset> * 0)` is 0 when a design sets the offset, invalid (the container's own
    // value) when not.
    --vc-container-px: var(--inherited-container-px, var(--vc-frame-padding-x));
    --vc-container-max-width: var(--inherited-container-max-width, var(--vc-frame-max-width));
    --vc-container-pt: var(--inherited-container-pt, calc(var(--vc-frame-main-offset-top, var(--vc-frame-gap)) * 0));
    --vc-container-pb: var(--inherited-container-pb, calc(var(--vc-frame-main-offset-bottom, var(--vc-frame-gap)) * 0));

    @apply relative flex grow flex-col;

    min-height: var(--vc-frame-main-min-height, auto);
    margin-block: var(--vc-frame-main-offset-top, var(--vc-frame-gap, 0px))
      var(--vc-frame-main-offset-bottom, var(--vc-frame-gap, 0px));
  }
}
</style>
