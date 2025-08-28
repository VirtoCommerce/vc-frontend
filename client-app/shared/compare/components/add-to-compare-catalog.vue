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
import { computed, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useConfigurableProduct } from "@/shared/catalog/composables/useConfigurableProduct";
import { useCompareProducts } from "../composables";
import type { Product, ConfigurationSectionInput } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  iconSize?: VcIconSizeType;
}

const props = defineProps<IProps>();

const product = toRef(props, "product");

const { t } = useI18n();
const { isInCompareList: isInCompareListFn, addToCompareList, removeFromCompareList } = useCompareProducts();
const { selectedConfigurationInput } = useConfigurableProduct(product.value.id);

const isInCompareList = computed(() =>
  isInCompareListFn(product.value, selectedConfigurationInput.value as ConfigurationSectionInput[]),
);

const tooltipText = computed<string>(() =>
  isInCompareList.value
    ? t("shared.compare.add_to_compare.tooltips.remove")
    : t("shared.compare.add_to_compare.tooltips.add"),
);

const toggle = () => {
  if (isInCompareList.value) {
    removeFromCompareList(product.value);
  } else {
    addToCompareList(product.value, selectedConfigurationInput.value as ConfigurationSectionInput[]);
  }
};
</script>
