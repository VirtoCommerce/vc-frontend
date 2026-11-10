<template>
  <div class="vc-frame">
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
import { Comment, Fragment, inject, isVNode, provide, Text } from "vue";
import { vcFrameKey } from "./vc-frame-context";
import type { VNode, VNodeArrayChildren } from "vue";

defineSlots<{
  /**
   * The page header. Rendered with no wrapper: each root element of this slot is a direct child of the frame, so a
   * `position: sticky` piece sticks for the whole page. Wrapping the pieces in one block element kills sticky.
   */
  header?: () => VNode[];
  /** The page content, inside the frame's `<main id="main-content">`, the skip-to-content target. */
  default?: () => VNode[];
  /**
   * The page footer, inside the frame's `vc-frame__footer` div; no div when the slot renders only comments or blank
   * text.
   */
  footer?: () => VNode[];
}>();

if (import.meta.env.DEV && inject(vcFrameKey, false)) {
  // eslint-disable-next-line no-console
  console.warn(
    'VcFrame: rendered inside another VcFrame. A page has one frame: one <main id="main-content">, one header and footer.',
  );
}

provide(vcFrameKey, true);

function isBlank(value: unknown): boolean {
  return String(value).trim() === "";
}

function hasContent(nodes: VNodeArrayChildren | undefined): boolean {
  return (nodes ?? []).some((node) => {
    if (Array.isArray(node)) {
      return hasContent(node);
    }

    if (!isVNode(node)) {
      return (typeof node === "string" || typeof node === "number") && !isBlank(node);
    }

    if (node.type === Comment) {
      return false;
    }

    if (node.type === Fragment) {
      return hasContent(node.children as VNodeArrayChildren);
    }

    if (node.type === Text) {
      return !isBlank(node.children);
    }

    return true;
  });
}
</script>

<style lang="scss">
// Tokens and their classic fallbacks: assets/styles/README.md, "Page frame".
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
    // VcContainers in the page take the frame's side space and column and leave the space above and below to the
    // frame; their props and page-set padding still win. `calc(<offset> * 0)` is 0 when the offset or the gap is set
    // (by a design or a fork), invalid (the container's own value) when neither.
    --vc-container-px: var(--inherited-container-px, var(--vc-frame-padding-x));
    --vc-container-max-width: var(--inherited-container-max-width, var(--vc-frame-max-width));
    --vc-container-pt: var(--inherited-container-pt, calc(var(--vc-frame-main-offset-top, var(--vc-frame-gap)) * 0));
    --vc-container-pb: var(--inherited-container-pb, calc(var(--vc-frame-main-offset-bottom, var(--vc-frame-gap)) * 0));

    @apply relative flex grow flex-col min-h-[var(--vc-frame-main-min-height,auto)];

    margin-block: var(--vc-frame-main-offset-top, var(--vc-frame-gap, 0px))
      var(--vc-frame-main-offset-bottom, var(--vc-frame-gap, 0px));
    // A jump to main (the skip link) keeps the frame's space above the page.
    scroll-margin-block-start: var(--vc-frame-main-offset-top, var(--vc-frame-gap, 0px));
  }
}
</style>
