<template>
  <div class="flex items-center">
    <div
      class="flex h-11 grow items-center rounded border border-[color:var(--color-branch-dialog-input-border)] bg-white pl-4 pr-2.5 sm:h-auto sm:pr-0.5"
    >
      <input
        class="h-full w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--color-branch-dialog-input-text)] sm:h-7 sm:text-xs"
        type="text"
        :placeholder="$t('shared.catalog.branches_dialog.search_input_placeholder')"
        :value="modelValue"
        @input="onInput($event)"
      />
      <button
        type="button"
        class="flex h-5 w-6 items-center justify-center outline-none"
        :disabled="!modelValue.length"
        @click="emit('update:input', '')"
      >
        <svg
          class="h-3 w-3 text-[color:var(--color-primary)] sm:h-2.5 sm:w-2.5"
          :class="{
            'text-[color:var(--color-branch-dialog-input-reset-icon)]': !modelValue.length,
          }"
        >
          <use href="/static/images/delete.svg#main"></use>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["update:input"]);

defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:input", target.value);
}
</script>
