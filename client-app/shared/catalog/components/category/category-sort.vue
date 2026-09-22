<template>
  <VcTabSwitchGroup variant="seg" class="category-sort" :aria-label="$t('shared.catalog.sort.aria_label')">
    <VcTabSwitch
      v-for="option in options"
      :key="option.id"
      :model-value="pressed"
      :value="option.id"
      :label="option.shortName"
      :aria-label="option.name"
      :disabled="loading"
      size="sm"
      :data-test-id="`sort-tab-${option.id || 'default'}`"
      @change="select"
    />
  </VcTabSwitchGroup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { IProductSortingOption } from "@/shared/catalog/composables/useProductSortings";

interface IEmits {
  (event: "change", id: string): void;
}

interface IProps {
  options: IProductSortingOption[];
  loading?: boolean;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

// VcTabSwitch never writes its own model — it reports the pressed value and the owner commits it.
const modelValue = defineModel<string | undefined>();

// What the pointer chose, held only until the search that the choice started comes back. The model
// behind this control follows the backend's own `selected` flag, which is a round trip away, and a
// rail that waits for it does not answer the click for a second and a half — long enough to read as
// a control that did not take the press.
const pending = ref<string | undefined>();

const pressed = computed(() => pending.value ?? modelValue.value);

// The backend is authoritative again the moment it has answered — including when it answers with a
// sorting other than the one pressed, which is the case a permanently held guess would hide.
watch(
  () => props.loading,
  (isLoading, wasLoading) => {
    if (wasLoading && !isLoading) {
      pending.value = undefined;
    }
  },
);

function select(id: string) {
  if (id === pressed.value) {
    return;
  }

  pending.value = id;
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
