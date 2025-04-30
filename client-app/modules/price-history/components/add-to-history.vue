<template>
  <VcProductActionsButton
    icon="table"
    :icon-size="iconSize"
    :active="isInList"
    :tooltip-text="tooltipText"
    @click="toggle"
  />
</template>

<script setup lang="ts">
import { eagerComputed, useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import { PRICE_HISTORY_ITEMS_KEY } from "../constants";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  iconSize?: VcIconSizeType;
}

const props = defineProps<IProps>();
const productsIds = useLocalStorage<string[]>(PRICE_HISTORY_ITEMS_KEY, []);

const isInList = eagerComputed<boolean>(() => productsIds.value.includes(props.product.id));

const tooltipText = computed<string>(() => (isInList.value ? "remove from history" : "add to history"));

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
