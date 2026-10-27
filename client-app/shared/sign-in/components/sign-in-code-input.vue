<template>
  <div
    class="sign-in-code-input"
    :class="{
      'sign-in-code-input--focused': isFocused,
      'sign-in-code-input--error': error,
      'sign-in-code-input--busy': busy,
    }"
  >
    <input
      :id="inputId"
      ref="inputRef"
      v-model="code"
      class="sign-in-code-input__input"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      pattern="[0-9]*"
      :aria-invalid="error"
      :aria-describedby="describedBy"
      :data-test-id="testId"
      @paste="onPaste"
      @keydown="onKeydown"
      @click="moveCaretToEnd"
      @select="moveCaretToEnd"
      @focus="onFocus"
      @blur="isFocused = false"
    />

    <div class="sign-in-code-input__cells" :style="{ '--code-length': length }" aria-hidden="true">
      <div
        v-for="index in length"
        :key="index"
        class="sign-in-code-input__cell"
        :class="{
          'sign-in-code-input__cell--active': isFocused && index - 1 === activeIndex,
        }"
      >
        {{ code[index - 1] }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";

interface IProps {
  inputId: string;
  testId?: string;
  describedBy?: string;
  length: number;
  error?: boolean;
  busy?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  testId: undefined,
  describedBy: undefined,
  error: false,
  busy: false,
});

const code = defineModel<string>({
  required: true,
  set: (value) => value.replace(/\D/g, "").slice(0, props.length),
});

const CARET_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]);

const inputRef = useTemplateRef<HTMLInputElement>("inputRef");
const isFocused = ref(false);
const activeIndex = computed(() => Math.min(code.value.length, props.length - 1));

function onFocus(): void {
  isFocused.value = true;
  moveCaretToEnd();
}

function onKeydown(event: KeyboardEvent): void {
  if (CARET_KEYS.has(event.key)) {
    event.preventDefault();
  }
}

function moveCaretToEnd(): void {
  const input = inputRef.value;
  if (input) {
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

function onPaste(event: ClipboardEvent): void {
  const pasted = event.clipboardData?.getData("text") ?? "";
  if (!/\d/.test(pasted)) {
    return;
  }

  event.preventDefault();

  const standaloneCode = new RegExp(String.raw`(?<!\d)\d{${props.length}}(?!\d)`).exec(pasted)?.[0];
  code.value = standaloneCode ?? pasted;
}

function focus(): void {
  inputRef.value?.focus();
}

defineExpose({ focus });
</script>

<style lang="scss">
.sign-in-code-input {
  @apply relative mb-3 rounded-md;

  &__input {
    position: absolute;
    inset: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    color: transparent;
    background: transparent;
    caret-color: transparent;
    border: 0;

    &:focus {
      outline: none;
    }

    // Browsers force selected text to be visible regardless of `color`, so a plain
    // color:transparent above still lets input.select() paint the raw digits on top of the cells.
    &::selection {
      color: transparent;
      background: transparent;
    }
  }

  &__cells {
    @apply grid gap-2;

    grid-template-columns: repeat(var(--code-length), minmax(0, 1fr));
  }

  &__cell {
    @apply flex h-14 items-center justify-center rounded-md border border-neutral-500 bg-additional-50 text-lg font-semibold tabular-nums;
  }

  &--focused &__cell--active {
    @apply border-accent-700 ring-1 ring-accent-700;
  }

  &--error &__cell {
    @apply border-danger-600;
  }

  &--busy &__cells {
    @apply opacity-60;
  }
}
</style>
