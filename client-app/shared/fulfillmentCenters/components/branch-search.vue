<template>
  <div class="flex items-center">
    <div
      class="flex h-11 grow items-center rounded border border-[color:var(--color-branch-modal-input-border)] bg-white pl-4 pr-2.5 sm:h-auto sm:pr-0.5"
    >
      <input
        class="size-full bg-transparent text-sm outline-none placeholder:text-[color:var(--color-branch-modal-input-text)] sm:h-7 sm:text-xs"
        type="text"
        :placeholder="$t('shared.catalog.branches_modal.search_input_placeholder')"
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
          class="size-3 text-[color:var(--color-primary)] sm:size-2.5"
          :class="{
            'text-[color:var(--color-branch-modal-input-reset-icon)]': !modelValue.length,
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
