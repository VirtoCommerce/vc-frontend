<template>
  <div
    :class="[
      'vc-select-button',
      `vc-select-button--size--${size}`,
      {
        'vc-select-button--disabled': disabled,
        'vc-select-button--readonly': readonly,
        'vc-select-button--opened': opened,
        'vc-select-button--error': error,
      },
    ]"
  >
    <!-- A sibling of the clear button (buttons cannot nest), with role="combobox" because
         `aria-activedescendant` is not allowed on role=button (APG select-only combobox). -->
    <button
      :id="triggerId"
      ref="controlElement"
      type="button"
      role="combobox"
      class="vc-select-button__control"
      :aria-label="accessibleLabel"
      :aria-expanded="opened"
      aria-haspopup="listbox"
      :aria-controls="opened ? listboxId : undefined"
      :aria-activedescendant="activeDescendantId"
      :aria-invalid="error || undefined"
      :aria-required="required || undefined"
      :aria-disabled="disabled || undefined"
      :aria-describedby="detailsId"
      @click.stop="$emit('toggle')"
      @keydown.enter.prevent="$emit('confirm', $event)"
      @keydown.space.prevent="$emit('confirm', $event)"
      @keydown.down.prevent="$emit('navigate', 'down')"
      @keydown.up.prevent="$emit('navigate', 'up')"
      @keydown.home.prevent="$emit('navigate', 'home')"
      @keydown.end.prevent="$emit('navigate', 'end')"
      @keydown.tab="$emit('tab', $event)"
    >
      <span class="vc-select-button__content">
        <slot v-if="hasSelection" name="selected" v-bind="{ item: selectedItem as T, error }" />

        <slot v-else name="placeholder" v-bind="{ error }" />
      </span>
    </button>

    <VcButton
      v-if="clearVisible"
      :aria-label="$t('ui_kit.buttons.clear')"
      :disabled="disabled"
      type="button"
      icon="delete-thin"
      color="neutral"
      variant="ghost"
      class="vc-select-button__clear"
      :icon-size="getInputClearIconSize(size)"
      @keydown.enter.stop.prevent
      @keyup.enter.stop.prevent="$emit('clear')"
      @click.stop="$emit('clear')"
    />

    <VcIcon v-if="!readonly" class="vc-select-button__icon" :name="opened ? 'chevron-up' : 'chevron-down'" size="xs" />
  </div>
</template>

<script setup lang="ts" generic="T">
import { useTemplateRef } from "vue";
import { getInputClearIconSize } from "@/ui-kit/utilities";

defineEmits<{
  (event: "toggle"): void;
  (event: "clear"): void;
  (event: "navigate", key: "up" | "down" | "home" | "end"): void;
  (event: "confirm", payload: KeyboardEvent): void;
  (event: "tab", payload: KeyboardEvent): void;
}>();

defineProps<{
  /** Resolved item behind the model value; handed to the `selected` slot. */
  selectedItem?: T;
  hasSelection: boolean;
  size: "xs" | "sm" | "md" | "auto";
  opened: boolean;
  clearVisible: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: boolean;
  required?: boolean;
  accessibleLabel?: string;
  triggerId: string;
  listboxId: string;
  detailsId: string;
  activeDescendantId?: string;
}>();

// `selected` renders only behind `hasSelection`, so its item is never undefined.
defineSlots<{
  selected?: (props: { item: T; error?: boolean }) => unknown;
  placeholder?: (props: { error?: boolean }) => unknown;
}>();

const controlElement = useTemplateRef<HTMLButtonElement>("controlElement");

defineExpose({
  focus(): void {
    controlElement.value?.focus();
  },
});
</script>

<style lang="scss">
@use "@/ui-kit/styles/focus-ring" as *;

.vc-select-button {
  $self: &;
  $disabled: "";
  $error: "";

  --radius: var(--vc-select-radius, var(--vc-radius, 0.5rem));

  @apply relative flex items-center w-full rounded-[--radius] border bg-additional-50 appearance-none text-start;

  // `auto` declares none of the three, so each declaration is unset: no minimum, inherited text.
  min-height: var(--min-height);
  font-size: var(--text-size);
  line-height: var(--line-height);

  // VcInput's scale, as a minimum: the slots may hold taller content.
  &--size {
    &--xs {
      --min-height: theme("spacing.8");
      --text-size: theme("fontSize.sm[0]");
      --line-height: theme("fontSize.sm[1].lineHeight");
    }

    &--sm {
      // No 2.375rem spacing token — literal, same as vc-input.
      --min-height: 2.375rem;
      --text-size: theme("fontSize.base[0]");
      --line-height: theme("fontSize.base[1].lineHeight");
    }

    &--md {
      --min-height: theme("spacing.11");
      --text-size: theme("fontSize.base[0]");
      --line-height: theme("fontSize.base[1].lineHeight");
    }
  }

  &--disabled {
    $disabled: &;

    @apply bg-neutral cursor-not-allowed pointer-events-none;
  }

  &--readonly {
    @apply pointer-events-none;
  }

  &--error {
    $error: &;

    @apply border-danger;
  }

  // The ring outlines the whole box, as VcInput's does, not the inner control. Open looks like
  // focus, whichever way it was opened.
  &:has(#{$self}__control:focus-visible),
  &--opened {
    @include focus-ring;
  }

  &__control {
    @apply grow flex self-stretch min-w-0 text-start;

    &:focus-visible {
      @apply outline-none;
    }

    // Stretches the hit area over the chevron; the clear button is positioned and later in the
    // DOM, so it stays above it.
    &::after {
      @apply absolute inset-0;

      content: "";
    }
  }

  &__content {
    @apply grow overflow-y-hidden flex flex-col justify-center min-w-0;

    #{$error} & {
      @apply text-danger;
    }
  }

  &__icon {
    --vc-icon-color: var(--color-neutral-900);

    @apply me-3;

    #{$disabled} & {
      --vc-icon-color: var(--color-neutral-400);
    }
  }
}
</style>
