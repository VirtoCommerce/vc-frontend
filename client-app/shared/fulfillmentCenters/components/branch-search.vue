<template>
  <div class="flex items-center">
    <div
      class="h-11 sm:h-auto flex-grow flex items-center pl-4 pr-2.5 sm:pr-0.5 rounded border border-[color:var(--color-branch-dialog-input-border)] bg-white"
    >
      <input
        class="h-full sm:h-7 w-full placeholder:text-[color:var(--color-branch-dialog-input-text)] outline-none bg-transparent text-sm sm:text-xs"
        type="text"
        :placeholder="$t('shared.catalog.branches_dialog.search_input_placeholder')"
        :value="modelValue"
        @input="onInput($event)"
      />
      <button
        class="flex items-center justify-center w-6 h-5 outline-none"
        :disabled="!modelValue.length"
        @click="emit('update:input', '')"
      >
        <svg
          class="w-3 h-3 text-[color:var(--color-primary)] sm:w-2.5 sm:h-2.5"
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
