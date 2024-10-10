<template>
  <VcProductActionsButton
    icon="compare"
    :icon-size="iconSize"
    :active="isInCompareList"
    :tooltip-text="tooltipText"
    @click="toggle"
  />
</template>

<script setup lang="ts">
import { eagerComputed } from "@vueuse/core";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCompareProducts } from "../composables";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  iconSize?: VcIconSizeType;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { productsIds, addToCompareList, removeFromCompareList } = useCompareProducts();

const isInCompareList = eagerComputed<boolean>(() => productsIds.value.includes(props.product.id));

const tooltipText = computed<string>(() =>
  isInCompareList.value
    ? t("shared.compare.add_to_compare.tooltips.remove")
    : t("shared.compare.add_to_compare.tooltips.add"),
);

const toggle = () => {
  if (isInCompareList.value) {
    removeFromCompareList(props.product);
  } else {
    addToCompareList(props.product);
  }
};
</script>
