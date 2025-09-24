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
import { CONFIGURABLE_SECTION_TYPES } from "@/shared/catalog/constants/configurableProducts";
import { useCompareProducts } from "../composables/useCompareProducts";
import type { Product, ConfigurationSectionInput } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  iconSize?: VcIconSizeType;
}

const props = defineProps<IProps>();

const product = toRef(props, "product");

const { t } = useI18n();
const { isInCompareList: isInCompareListFn, addToCompareList, removeFromCompareList } = useCompareProducts();
const { configuration, selectedConfiguration, selectedConfigurationInput } = useConfigurableProduct(product.value.id);

const isInCompareList = computed(() => {
  const selectedConfigurationInputWithoutFiles = selectedConfigurationInput.value.filter(
    (section) => section.type !== CONFIGURABLE_SECTION_TYPES.file,
  );
  return isInCompareListFn(product.value, selectedConfigurationInputWithoutFiles as ConfigurationSectionInput[]);
});

const tooltipText = computed<string>(() =>
  isInCompareList.value
    ? t("shared.compare.add_to_compare.tooltips.remove")
    : t("shared.compare.add_to_compare.tooltips.add"),
);

const toggle = () => {
  const selectedConfigurationInputWithoutFiles = selectedConfigurationInput.value.filter(
    (section) => section.type !== CONFIGURABLE_SECTION_TYPES.file,
  );
  if (isInCompareList.value) {
    removeFromCompareList(product.value, selectedConfigurationInputWithoutFiles as ConfigurationSectionInput[]);
  } else {
    const properties = Object.entries(selectedConfiguration.value)
      .filter((entry) => !entry[1]?.files.length)
      .map(([sectionId, _section]) => {
        const section = configuration.value.find((s) => s.id === sectionId);
        return {
          id: sectionId,
          label: section?.name ?? "",
          value: _section?.selectedOptionTextValue ?? "",
        };
      });
    addToCompareList(product.value, selectedConfigurationInput.value as ConfigurationSectionInput[], properties);
  }
};
</script>
