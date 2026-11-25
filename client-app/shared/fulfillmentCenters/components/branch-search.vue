<template>
  <div class="branch-search">
    <div class="branch-search__field">
      <VcInput
        class="branch-search__input"
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

<style lang="scss">
.branch-search {
  @apply flex items-center;

  &__field {
    @apply flex h-11 grow items-center pe-2.5;

    @media (width >= theme("screens.sm")) {
      @apply h-auto pe-0;
    }
  }

  &__input {
    @apply w-full;
  }
}
</style>
