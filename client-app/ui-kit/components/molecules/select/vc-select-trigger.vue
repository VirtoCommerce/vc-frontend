<template>
  <div
    v-if="$slots.selected || $slots.placeholder"
    ref="rootElement"
    :class="[
      'vc-select-trigger',
      'vc-select-trigger--button',
      `vc-select-trigger--size--${size}`,
      {
        'vc-select-trigger--disabled': disabled,
        'vc-select-trigger--readonly': readonly,
        'vc-select-trigger--opened': opened,
        'vc-select-trigger--error': error,
      },
    ]"
  >
    <!-- A sibling of the clear button (buttons cannot nest), with role="combobox" because
         `aria-activedescendant` is not allowed on role=button (APG select-only combobox). -->
    <button
      :id="triggerId"
      type="button"
      role="combobox"
      class="vc-select-trigger__button"
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
      <span class="vc-select-trigger__content">
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
      class="vc-select-trigger__clear"
      :icon-size="getInputClearIconSize(size)"
      @keydown.enter.stop.prevent
      @keyup.enter.stop.prevent="$emit('clear')"
      @click.stop="$emit('clear')"
    />

    <VcIcon class="vc-select-trigger__icon" :name="opened ? 'chevron-up' : 'chevron-down'" size="xs" />
  </div>

  <VcInput
    v-else
    ref="rootElement"
    :model-value="search"
    :class="[
      'vc-select-trigger',
      'vc-select-trigger--field',
      {
        'vc-select-trigger--readonly': readonly,
        'vc-select-trigger--opened': opened,
      },
    ]"
    :aria-label="accessibleLabel"
    :aria="{
      id: triggerId,
      role: 'combobox',
      'aria-expanded': String(opened),
      'aria-haspopup': 'listbox',
      'aria-controls': opened ? listboxId : null,
      'aria-activedescendant': activeDescendantId ?? null,
      'aria-invalid': error ? 'true' : null,
      'aria-required': required ? 'true' : null,
      'aria-autocomplete': autocomplete ? 'list' : null,
      'aria-describedby': detailsId,
    }"
    :required="required"
    :size="size"
    :placeholder="placeholderText"
    :disabled="disabled"
    :readonly="readonly || !autocomplete"
    :error="error"
    :opened="opened"
    truncate
    disable-autocomplete
    @update:model-value="$emit('update:search', String($event ?? ''))"
    @keydown.down.prevent="$emit('navigate', 'down')"
    @keydown.up.prevent="$emit('navigate', 'up')"
    @keydown.home="onHome"
    @keydown.end="onEnd"
    @keydown.enter="$emit('confirm', $event)"
    @click="onClick"
    @keydown.tab="$emit('tab', $event)"
  >
    <template #append>
      <VcButton
        v-if="clearVisible"
        :aria-label="$t('ui_kit.buttons.clear')"
        :disabled="disabled"
        type="button"
        icon="delete-thin"
        color="neutral"
        variant="ghost"
        class="vc-select-trigger__clear"
        :icon-size="getInputClearIconSize(size)"
        @keydown.enter.stop.prevent
        @keyup.enter.stop.prevent="$emit('clear')"
        @click.stop="$emit('clear')"
      />

      <VcButton
        :aria-label="$t('ui_kit.buttons.toggle_dropdown')"
        :disabled="disabled"
        :icon="opened ? 'chevron-up' : 'chevron-down'"
        type="button"
        color="neutral"
        variant="ghost"
        tabindex="-1"
        class="vc-select-trigger__arrow"
        @click.stop="$emit('toggle')"
      />
    </template>
  </VcInput>
</template>

<script setup lang="ts" generic="T">
import { useTemplateRef } from "vue";
import { getInputClearIconSize } from "@/ui-kit/utilities";

const emit = defineEmits<{
  (event: "toggle"): void;
  (event: "open"): void;
  (event: "clear"): void;
  (event: "navigate", key: "up" | "down" | "home" | "end"): void;
  (event: "confirm", payload: KeyboardEvent): void;
  (event: "tab", payload: KeyboardEvent): void;
  (event: "update:search", value: string): void;
}>();

const props = defineProps<{
  /** Resolved item behind the model value; drives which of the two slots renders. */
  selectedItem?: T;
  hasSelection: boolean;
  search: string;
  placeholderText?: string;
  size: "xs" | "sm" | "md" | "auto";
  opened: boolean;
  clearVisible: boolean;
  autocomplete?: boolean;
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

// Focus never opens the list (APG). A plain select toggles on click; autocomplete only opens,
// since a click in the field places the caret.
function onClick(): void {
  if (props.autocomplete) {
    emit("open");
    return;
  }

  emit("toggle");
}

// Home/End belong to the caret in an editable field.
function onHome(event: KeyboardEvent): void {
  if (!props.autocomplete) {
    event.preventDefault();
    emit("navigate", "home");
  }
}

function onEnd(event: KeyboardEvent): void {
  if (!props.autocomplete) {
    event.preventDefault();
    emit("navigate", "end");
  }
}

const rootElement = useTemplateRef<HTMLElement | { $el: HTMLElement }>("rootElement");

defineExpose({
  focus(): void {
    const element = rootElement.value;

    if (!element) {
      return;
    }

    const node = "$el" in element ? element.$el : element;

    (node.querySelector<HTMLElement>(".vc-select-trigger__button, input") ?? node).focus();
  },
});
</script>

<style lang="scss">
@use "@/ui-kit/styles/focus-ring" as *;

.vc-select-trigger {
  $self: &;
  $disabled: "";
  $readonly: "";
  $opened: "";
  $error: "";

  --radius: var(--vc-select-radius, var(--vc-radius, 0.5rem));

  &--disabled {
    $disabled: &;
  }

  &--readonly {
    $readonly: &;
  }

  &--opened {
    $opened: &;
  }

  &--error {
    $error: &;
  }

  // The field branch is a VcInput and paints its own box, border and size.
  &--button {
    @apply relative flex items-center w-full rounded-[--radius] border bg-additional-50 appearance-none text-start;

    // The ring outlines the whole box, as VcInput's does, not the inner button.
    &:has(#{$self}__button:focus-visible) {
      @include focus-ring;
    }

    &#{$disabled} {
      @apply bg-neutral cursor-not-allowed pointer-events-none;
    }

    &#{$readonly} {
      @apply pointer-events-none;
    }

    &#{$error} {
      @apply border-danger;
    }

    // Open looks like focus, whichever way it was opened.
    &#{$opened} {
      @include focus-ring;
    }
  }

  // VcInput's scale; `auto` takes its height from the content.
  &--size {
    &--xs {
      @apply h-8 text-sm;
    }

    &--sm {
      @apply h-[2.375rem] text-base;
    }

    &--md {
      @apply h-11 text-base;
    }
  }

  &--field {
    @apply w-full cursor-pointer;

    input {
      @apply cursor-pointer;
    }

    &#{$opened} input {
      @apply cursor-auto;
    }
  }

  &__button {
    @apply grow flex min-w-0 h-full text-start;

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
    @apply grow overflow-y-hidden flex flex-col justify-center min-w-0 h-full;

    #{$error} & {
      @apply text-danger;
    }
  }

  &__clear {
    @apply relative;
  }

  &__arrow {
    #{$readonly} & {
      @apply hidden;
    }
  }

  &__icon {
    @apply shrink-0 me-3 text-neutral-900;

    #{$disabled} & {
      @apply text-neutral-400;
    }

    #{$readonly} & {
      @apply hidden;
    }
  }
}
</style>
