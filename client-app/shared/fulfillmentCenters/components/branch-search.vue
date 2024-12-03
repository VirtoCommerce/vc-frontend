<template>
  <div class="flex items-center">
    <div
      class="flex h-11 grow items-center rounded border border-neutral-300 bg-additional-50 pl-4 pr-2.5 sm:h-auto sm:pr-0.5"
    >
      <input
        class="size-full bg-transparent text-sm outline-none placeholder:text-neutral-400 sm:h-7 sm:text-xs"
        type="text"
        :placeholder="$t('shared.catalog.branches_modal.search_input_placeholder')"
        :value="modelValue"
        @input="onInput($event)"
      />
      <button
        type="button"
        class="flex h-5 w-6 items-center justify-center text-primary outline-none disabled:text-neutral-400"
        :disabled="!modelValue.length"
        @click="emit('update:input', '')"
      >
        <VcIcon name="delete" class="size-3 sm:size-2.5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "update:input", value: string): void;
}

const emit = defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  modelValue: "",
});

interface IProps {
  modelValue?: string;
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:input", target.value);
}
</script>
