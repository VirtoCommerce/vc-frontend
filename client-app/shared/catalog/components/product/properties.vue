<template>
  <ProductTitledBlock
    v-if="showPropertiesBlock"
    :title="model.title || $t('shared.catalog.product_details.technical_specs_block_title')"
    icon="adjustments"
  >
    <VcCollapsibleContent max-height="12.5rem">
      <div class="space-y-4">
        <VcProperty v-for="property in properties" :key="property.name" :label="property.label!" class="text-base">
          {{ property.value }}
        </VcProperty>

        <!-- Rating -->
        <VcProperty
          v-if="productReviewsEnabled && product.rating"
          :label="$t('shared.catalog.product_card.product_rating')"
          class="text-base"
        >
          <Rating :rating="product.rating" />
        </VcProperty>

        <!-- Vendor -->
        <VcProperty v-if="showVendor" :label="$t('shared.catalog.product_details.vendor_label')" class="text-base">
          <Vendor :vendor="product.vendor!" with-rating />
        </VcProperty>
      </div>
    </VcCollapsibleContent>
    <!-- Properties -->
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { PropertyType } from "@/core/api/graphql/types";
import { configInjectionKey } from "@/core/injection-keys";
import { getPropertiesGroupedByName } from "@/core/utilities";
import { ProductTitledBlock, Rating, Vendor } from "@/shared/catalog";
import { useCustomerReviews } from "@/shared/common";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  model: {
    title?: string;
    hidden?: boolean;
  };
}

const props = defineProps<IProps>();

const config = inject(configInjectionKey, {});

const { enabled: productReviewsEnabled } = useCustomerReviews();

const properties = computed(() =>
  Object.values(getPropertiesGroupedByName(props.product.properties ?? [], PropertyType.Product)),
);

const showVendor = computed(() => config.vendor_enabled && !props.product.hasVariations && props.product.vendor);
const showPropertiesBlock = computed(() => !props.model.hidden && (properties.value.length || showVendor.value));
</script>
