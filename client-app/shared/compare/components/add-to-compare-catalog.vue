<template>
  <VcTooltip width="max-content">
    <template #trigger>
      <slot :is-in-compare-list="isInCompareList" :toggle="toggle">
        <button :aria-label="tooltipText" type="button" class="flex" tabindex="0" @click="toggle">
          <VcIcon :class="[customClass, isInCompareList ? 'text-primary' : 'text-neutral-400']" name="compare" />
        </button>
      </slot>
    </template>

    <template #content>
      {{ tooltipText }}
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { eagerComputed } from "@vueuse/core";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCompareProducts } from "../composables";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  customClass?: string;
  tooltipPlacement?: VcTooltipPlacementType;
}

const props = withDefaults(defineProps<IProps>(), {
  customClass: "w-5 h-5 lg:w-4 lg:h-4",
  tooltipPlacement: "left",
});

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
