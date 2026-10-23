<template>
  <VcMenuItem
    v-if="menuItem"
    color="secondary"
    :active="isInCompareList"
    nowrap
    data-test-id="add-to-compare-menu-item"
    @click="onMenuItemClick"
  >
    <template #prepend>
      <VcIcon name="compare" />
    </template>

    <span>{{ tooltipText }}</span>
  </VcMenuItem>

  <VcProductActionsButton
    v-else
    icon="compare"
    :icon-size="iconSize"
    :active="isInCompareList"
    :aria-label="tooltipText"
    :aria-pressed="isInCompareList"
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

interface IEmits {
  (event: "click"): void;
}

interface IProps {
  product: Product;
  iconSize?: VcIconSizeType;
  /** Renders the action as a `VcMenuItem` for a ⋮ menu. */
  menuItem?: boolean;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const product = toRef(props, "product");

const { t } = useI18n();
const { isInCompareList: isInCompareListFn, addToCompareList, removeFromCompareList } = useCompareProducts();
const { configuration, selectedConfiguration, selectedConfigurationInput } = useConfigurableProduct(product.value.id);

const selectedConfigurationInputWithoutFiles = computed(
  () =>
    selectedConfigurationInput.value.filter(
      (section) => section.type !== CONFIGURABLE_SECTION_TYPES.file,
    ) as ConfigurationSectionInput[],
);

const isInCompareList = computed(() => isInCompareListFn(product.value, selectedConfigurationInputWithoutFiles.value));

const tooltipText = computed(() =>
  isInCompareList.value
    ? t("shared.compare.add_to_compare.tooltips.remove")
    : t("shared.compare.add_to_compare.tooltips.add"),
);

function onMenuItemClick(): void {
  emit("click");
  toggle();
}

function toggle() {
  if (isInCompareList.value) {
    removeFromCompareList(product.value, selectedConfigurationInputWithoutFiles.value);
    return;
  }

  const properties = Object.entries(selectedConfiguration.value)
    .filter((entry) => !entry[1]?.files.length)
    .map(([sectionId, section]) => {
      const matchedConfiguration = configuration.value.find((s) => s.id === sectionId);
      return {
        label: matchedConfiguration?.name ?? "",
        value: section?.selectedOptionTextValue ?? "",
      };
    });

  addToCompareList(product.value, selectedConfigurationInput.value as ConfigurationSectionInput[], properties);
}
</script>
