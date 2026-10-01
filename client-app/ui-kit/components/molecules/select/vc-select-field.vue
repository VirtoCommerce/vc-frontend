<template>
  <VcInput
    ref="inputComponent"
    :model-value="search"
    :class="['vc-select-field', { 'vc-select-field--opened': opened }]"
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
    @keydown.space="onSpace"
    @click="onClick"
    @keydown.tab="$emit('tab', $event)"
    @focusout="$emit('focusout', $event)"
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
        class="vc-select-field__clear"
        :icon-size="getInputClearIconSize(size)"
        @keydown.enter.stop.prevent
        @keyup.enter.stop.prevent="$emit('clear')"
        @click.stop="$emit('clear')"
        @focusout="$emit('focusout', $event)"
      />

      <VcButton
        v-if="!readonly"
        :aria-label="$t('ui_kit.buttons.toggle_dropdown')"
        :disabled="disabled"
        :icon="opened ? 'chevron-up' : 'chevron-down'"
        type="button"
        color="neutral"
        variant="ghost"
        tabindex="-1"
        class="vc-select-field__arrow"
        @click.stop="$emit('toggle')"
        @focusout="$emit('focusout', $event)"
      />
    </template>
  </VcInput>
</template>

<script setup lang="ts">
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
  /** From the input and both buttons: VcInput hands its listeners to the input alone. */
  (event: "focusout", payload: FocusEvent): void;
}>();

const props = defineProps<{
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

// Focus never opens the list (APG). A plain select toggles on click; autocomplete only opens,
// since a click in the field places the caret.
function onClick(): void {
  if (props.autocomplete) {
    emit("open");
    return;
  }

  emit("toggle");
}

// A select-only field takes no typing, so Space opens the list or accepts an option, as Enter does (APG).
function onSpace(event: KeyboardEvent): void {
  if (!props.autocomplete) {
    event.preventDefault();
    emit("confirm", event);
  }
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

const inputComponent = useTemplateRef<{ inputElement?: HTMLInputElement }>("inputComponent");

defineExpose({
  focus(): void {
    inputComponent.value?.inputElement?.focus();
  },
});
</script>

<style lang="scss">
.vc-select-field {
  --vc-input-cursor: pointer;

  @apply w-full;

  &--opened {
    --vc-input-cursor: auto;
  }
}
</style>
