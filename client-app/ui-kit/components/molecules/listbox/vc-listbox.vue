<template>
  <div class="vc-listbox" :style="{ '--props-max-height': maxHeight }">
    <div v-if="$slots.header" class="vc-listbox__header">
      <slot name="header" />
    </div>

    <VcScrollbar
      :id="listId"
      vertical
      tag="ul"
      role="listbox"
      :focusable="focusable"
      :aria-label="listLabel"
      :aria-activedescendant="activeDescendantId"
      :aria-multiselectable="multiselectable || undefined"
      :class="['vc-listbox__list', { 'vc-listbox__list--dividers': dividers }]"
    >
      <slot />
    </VcScrollbar>

    <div v-if="$slots.footer" class="vc-listbox__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Id of the `<ul>`, so a combobox trigger can point `aria-controls` at it. */
    listId?: string;
    listLabel?: string;
    /** Sets `aria-multiselectable`; required by WAI-ARIA whenever more than one option can be picked. */
    multiselectable?: boolean;
    /**
     * Makes the list itself the tab stop. Needed when nothing else can own the keyboard: options
     * driven by `aria-activedescendant` are out of tab order, so a listbox with no combobox field
     * above it is unreachable without this. Leave it off whenever a field owns the keys.
     */
    focusable?: boolean;
    /** Id of the highlighted option, for the keyboard to be announced while focus stays on the list. */
    activeDescendantId?: string;
    dividers?: boolean;
    maxHeight?: string;
  }>(),
  {
    dividers: true,
  },
);
</script>

<style lang="scss">
.vc-listbox {
  $dividers: "";

  // The component paints itself instead of leaning on `--vc-popover-*`: it is also used
  // standalone, with no popover around it at all. The `--vc-dropdown-menu-*` fallbacks keep
  // overrides working for anyone who styled the select's dropdown before it moved here.
  --max-height: var(--props-max-height, var(--vc-listbox-max-height, var(--vc-dropdown-menu-max-height, 12rem)));
  --radius: var(--vc-listbox-radius, var(--vc-dropdown-menu-radius, var(--vc-radius, 0.5rem)));
  --bg-color: var(--vc-listbox-bg-color, var(--vc-dropdown-menu-bg-color, var(--color-additional-50)));

  // overflow-hidden lets the container round its own corners, so the first and last option
  // no longer need their own radius rules.
  @apply flex flex-col overflow-hidden rounded-[--radius] bg-[--bg-color] select-none;

  &__list {
    @apply max-h-[--max-height] w-full;

    &--dividers {
      $dividers: &;

      @apply divide-y divide-neutral-100;
    }
  }

  &__header,
  &__footer {
    @apply shrink-0;
  }

  &__header {
    @apply border-b border-neutral-100;
  }

  &__footer {
    @apply border-t border-neutral-100;
  }
}
</style>
