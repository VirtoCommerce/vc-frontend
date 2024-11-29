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
          <ProductRating :rating="product.rating" />
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
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { configInjectionKey } from "@/core/injection-keys";
import { getPropertiesGroupedByName } from "@/core/utilities";
import {
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
} from "@/modules/customer-reviews/constants";
import { ProductTitledBlock, Vendor } from "@/shared/catalog";
import type { Product } from "@/core/api/graphql/types";
import ProductRating from "@/modules/customer-reviews/components/product-rating.vue";

interface IProps {
  product: Product;
  model: {
    title?: string;
    hidden?: boolean;
  };
}

const props = defineProps<IProps>();

const config = inject(configInjectionKey, {});

const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
const productReviewsEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);

const properties = computed(() =>
  Object.values(getPropertiesGroupedByName(props.product.properties ?? [], PropertyType.Product)),
);

const showVendor = computed(() => config.vendor_enabled && !props.product.hasVariations && props.product.vendor);
const showPropertiesBlock = computed(() => !props.model.hidden && (properties.value.length || showVendor.value));
</script>
