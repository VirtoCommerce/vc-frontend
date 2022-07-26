<template>
  <div class="flex items-center">
    <div
      class="h-11 sm:h-auto flex-grow flex items-center mr-2 pl-4 pr-3 sm:pr-1 rounded border border-[color:var(--color-branch-dialog-input-border)] bg-white"
    >
      <input
        class="h-full sm:h-7 w-full placeholder:text-[color:var(--color-branch-dialog-input-text)] outline-none bg-transparent text-sm sm:text-xs"
        type="text"
        :placeholder="$t('shared.catalog.branches_dialog.search_input_placeholder')"
        :value="modelValue"
        @input="emit('update:input', $event.target.value)"
      />
      <button
        class="flex items-center justify-center w-5 h-5"
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
    <button class="w-11 h-11 sm:w-7 sm:h-7 rounded shadow-t-mds bg-primary sm:bg-white hover:bg-slate-50">
      <i class="fas fa-search text-white sm:text-primary text-xl sm:text-base" />
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
const input = ref<string>("");
const emit = defineEmits(["update:input"]);

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});
</script>
