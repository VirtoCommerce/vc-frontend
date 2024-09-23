<template>
  <button
    :aria-label="tooltipText"
    :title="tooltipText"
    type="button"
    :class="[
      'flex items-center justify-center disabled:text-neutral-300',
      product.inWishlist ? 'text-primary' : 'text-neutral-400',
    ]"
    tabindex="0"
    @click="toggle"
  >
    <VcIcon :class="customClass" name="compare" />
  </button>
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
  customClass: "size-5 lg:size-4",
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
