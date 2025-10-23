<template>
  <div class="space-y-6">
    <ProductPriceBlock :product="product">
      <slot />
    </ProductPriceBlock>

    <VcWidget v-if="showVendor && product.vendor" :title="$t('shared.catalog.product_details.vendor_label')" size="sm">
      <div class="test-base text-center font-bold [word-break:break-word]">
        {{ product.vendor.name }}
      </div>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useThemeContext } from "@/core/composables";
import ProductPriceBlock from "./product-price-block.vue";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
}

const props = defineProps<IProps>();

const product = toRef(props, "product");

const { themeContext } = useThemeContext();

const showVendor = computed(
  () => themeContext.value?.settings?.vendor_enabled && !product.value.hasVariations && product.value.vendor,
);
</script>
