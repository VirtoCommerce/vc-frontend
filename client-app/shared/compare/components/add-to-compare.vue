<template>
  <VcCheckbox v-if="workaround" :model-value="isInCompareList" @change="toggle">
    {{ $t("common.labels.compare") }}
  </VcCheckbox>
</template>

<script setup lang="ts">
import { eagerComputed, useDebounceFn } from "@vueuse/core";
import { nextTick, ref } from "vue";
import { useCompareProducts } from "@/shared/compare/composables/useCompareProducts";
import type { Product } from "@/core/api/graphql/types";
import type { PropType } from "vue";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const { productsIds, addToCompareList, removeFromCompareList } = useCompareProducts();

const workaround = ref(true); // See lines 34-36

const isInCompareList = eagerComputed<boolean>(() => productsIds.value.includes(props.product.id));

const toggle = useDebounceFn(() => {
  if (isInCompareList.value) {
    removeFromCompareList(props.product);
  } else {
    addToCompareList(props.product);
  }

  // FIXME: Workaround to update VcCheckbox component state after compare products limit exceeded
  workaround.value = false;
  nextTick(() => (workaround.value = true));
}, 400);
</script>
