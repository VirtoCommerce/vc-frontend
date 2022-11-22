<template>
  <VcTooltip :placement="tooltipPlacement" strategy="fixed">
    <template #trigger>
      <label v-if="workaround" class="cursor-pointer">
        <svg
          :class="[
            customClass,
            isInCompareList
              ? 'text-[color:var(--color-product-icon-active)]'
              : 'text-[color:var(--color-product-icon)]',
          ]"
        >
          <use href="/static/images/compare.svg#main"></use>
        </svg>
        <input type="checkbox" class="hidden" :model-value="isInCompareList" @change="toggle" />
      </label>
    </template>

    <template #content>
      <div class="bg-white rounded-sm text-xs text-tooltip shadow-sm-x-y py-1.5 px-3.5">Add to compare</div>
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { nextTick, PropType, ref } from "vue";
import { eagerComputed, useDebounceFn } from "@vueuse/core";
import { useCompareProducts } from "@/shared/compare";
import { Product } from "@/xapi/types";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
  customClass: {
    type: String,
    default: "w-6 h-6 lg:w-4 lg:h-4",
  },
  tooltipPlacement: {
    type: String,
    default: "left",
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
