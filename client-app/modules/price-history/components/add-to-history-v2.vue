<template>
  <button
    class="flex w-1/5 cursor-pointer items-center justify-center px-2 py-4 hover:bg-neutral-50"
    type="button"
    @click="toggle"
  >
    <VcIcon name="table" size="sm" :class="isInList ? 'fill-primary' : 'fill-neutral-400'" />
  </button>
</template>

<script setup lang="ts">
import { eagerComputed, useLocalStorage } from "@vueuse/core";
import { VcIcon } from "@/ui-kit/components";
import { PRICE_HISTORY_ITEMS_KEY } from "../constants";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  iconSize?: VcIconSizeType;
}

const props = defineProps<IProps>();
const productsIds = useLocalStorage<string[]>(PRICE_HISTORY_ITEMS_KEY, []);

const isInList = eagerComputed<boolean>(() => productsIds.value.includes(props.product.id));

const toggle = () => {
  if (isInList.value) {
    removeFromList(props.product);
  } else {
    addToCompareList(props.product);
  }
};

function removeFromList(product: Product) {
  const index = productsIds.value.indexOf(product.id);
  if (index !== -1) {
    productsIds.value.splice(index, 1);
  }
}

function addToCompareList(product: Product) {
  if (!productsIds.value.includes(product.id)) {
    productsIds.value.push(product.id);
  }
}
</script>
