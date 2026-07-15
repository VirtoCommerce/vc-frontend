<template>
  <VcWidget
    v-if="showVendor && product.vendor"
    :title="$t('shared.catalog.product_details.vendor_label')"
    size="sm"
    class="product-vendor"
    :class="{ 'product-vendor--hidden-print': product.hasVariations }"
  >
    <div class="product-vendor__name">
      {{ product.vendor.name }}
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useThemeContext } from "@/core/composables";
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

<style lang="scss">
.product-vendor {
  &--hidden-print {
    @media print {
      @apply hidden;
    }
  }

  &__name {
    @apply text-center font-bold;

    word-break: break-word;
  }
}
</style>
