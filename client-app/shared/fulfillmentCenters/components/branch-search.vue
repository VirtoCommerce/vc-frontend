<template>
  <div class="flex items-center">
    <div class="flex h-11 grow items-center bg-additional-50 pr-2.5 sm:h-auto sm:pr-0.5">
      <VcInput
        class="w-full"
        size="sm"
        type="text"
        :placeholder="$t('shared.catalog.branches_modal.search_input_placeholder')"
        :value="modelValue"
        clearable
        @input="onInput($event)"
        @clear="emit('update:input', '')"
      />
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
