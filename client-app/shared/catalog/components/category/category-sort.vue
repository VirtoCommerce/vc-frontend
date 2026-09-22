<template>
  <VcTabSwitchGroup variant="seg" class="category-sort" :aria-label="$t('common.labels.sort_by')">
    <VcTabSwitch
      v-for="option in options"
      :key="option.id"
      :model-value="modelValue"
      :value="option.id"
      :label="option.shortName"
      :aria-label="option.name"
      :disabled="loading"
      size="sm"
      data-test-id="sort-tab"
      @change="select"
    />
  </VcTabSwitchGroup>
</template>

<script setup lang="ts">
import type { IProductSortingOption } from "@/shared/catalog/composables/useProductSortings";

interface IEmits {
  (event: "change", id: string): void;
}

interface IProps {
  options: IProductSortingOption[];
  loading?: boolean;
}

const emit = defineEmits<IEmits>();

defineProps<IProps>();

// VcTabSwitch never writes its own model — it reports the pressed value and the owner commits it.
const modelValue = defineModel<string | undefined>();

function select(id: string) {
  if (id === modelValue.value) {
    return;
  }

  modelValue.value = id;
  emit("change", id);
}
</script>

<style lang="scss">
.category-sort {
  // Seven sortings do not fit a phone, and dropping the ones that overflow would hide them for good.
  @apply max-w-full overflow-x-auto;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    @apply hidden;
  }
}
</style>
