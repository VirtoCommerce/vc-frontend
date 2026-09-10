<template>
  <div
    v-if="$slots.selected || $slots.placeholder"
    :id="triggerId"
    ref="rootElement"
    tabindex="0"
    role="button"
    :aria-label="accessibleLabel"
    :aria-expanded="opened"
    aria-haspopup="listbox"
    :aria-controls="opened ? listboxId : undefined"
    :aria-activedescendant="activeDescendantId"
    :aria-invalid="error || undefined"
    :aria-required="required || undefined"
    :aria-disabled="disabled || undefined"
    :aria-describedby="detailsId"
    :class="['vc-select__button', `vc-select__button--size--${size}`]"
    @click="$emit('toggle')"
    @keydown.enter.prevent="$emit('confirm')"
    @keydown.space.prevent="$emit('confirm')"
    @keydown.down.prevent="$emit('navigate', 'down')"
    @keydown.up.prevent="$emit('navigate', 'up')"
    @keydown.home.prevent="$emit('navigate', 'home')"
    @keydown.end.prevent="$emit('navigate', 'end')"
    @keydown.esc="$emit('close')"
  >
    <div class="vc-select__button-content">
      <slot v-if="hasSelection" name="selected" v-bind="{ item: selectedItem as T, error }" />

      <slot v-else name="placeholder" v-bind="{ error }" />
    </div>

    <VcButton
      v-if="clearVisible"
      :aria-label="$t('ui_kit.buttons.clear')"
      :disabled="disabled"
      type="button"
      icon="delete-thin"
      color="neutral"
      variant="ghost"
      class="vc-select__clear"
      :icon-size="clearIconSize"
      @keydown.enter.stop.prevent
      @keyup.enter.stop.prevent="$emit('clear')"
      @click.stop="$emit('clear')"
    />

    <VcIcon class="vc-select__icon" :name="opened ? 'chevron-up' : 'chevron-down'" size="xs" />
  </div>

  <VcInput
    v-else
    ref="rootElement"
    :model-value="search"
    class="vc-select__input"
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
    truncate
    disable-autocomplete
    @update:model-value="$emit('update:search', String($event ?? ''))"
    @keydown.down.prevent="$emit('navigate', 'down')"
    @keydown.up.prevent="$emit('navigate', 'up')"
    @keydown.home="onHome"
    @keydown.end="onEnd"
    @keydown.enter.prevent="$emit('confirm')"
    @focus="$emit('open')"
    @keydown.esc="$emit('close')"
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
        class="vc-select__clear"
        :icon-size="clearIconSize"
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
        class="vc-select__arrow"
        @click.stop="$emit('toggle')"
      />
    </template>
  </VcInput>
</template>

<script setup lang="ts" generic="T">
import { computed, useTemplateRef } from "vue";

const emit = defineEmits<{
  (event: "toggle"): void;
  (event: "open"): void;
  (event: "close"): void;
  (event: "clear"): void;
  (event: "navigate", key: "up" | "down" | "home" | "end"): void;
  (event: "confirm"): void;
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

// The `selected` slot only renders behind `hasSelection`, so it always receives a real item —
// declaring it as `T` keeps consumers from having to narrow what cannot be undefined there.
defineSlots<{
  selected?: (props: { item: T; error?: boolean }) => unknown;
  placeholder?: (props: { error?: boolean }) => unknown;
}>();

// Mirrors the ternary in vc-input.vue:64. The shared `getInputClearIconSize` helper that
// would replace both lives in the unmerged VCST-5097 branch; adding a second definition
// here would collide on merge, so this stays local until that branch lands.
const clearIconSize = computed(() => (props.size === "md" ? "0.875rem" : "0.75rem"));

// Home/End move the text caret when the user is typing; only steal them when the field is
// read-only (a plain select), where there is no caret to move.
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

    (node.querySelector<HTMLElement>("[tabindex='0'], input") ?? node).focus();
  },
});
</script>
