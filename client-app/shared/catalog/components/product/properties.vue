<template>
  <ProductTitledBlock
    v-if="showPropertiesBlock"
    :title="model.title || $t('shared.catalog.product_details.technical_specs_block_title')"
    icon="adjustments"
  >
    <VcCollapsibleContent max-height="12.5rem">
      <div class="space-y-4">
        <VcProperty v-for="property in properties" :key="property.name" :label="property.label!" class="text-base">
          <span v-if="isHTML(property)" :title="String(property.value)">
            <VcMarkdownRender :src="String(property.value)" />
          </span>

          <span v-else :title="String(property.value)">{{ property.value }}</span>
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
import { computed } from "vue";
import { PropertyType } from "@/core/api/graphql/types";
import { useThemeContext } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { getPropertiesGroupedByName } from "@/core/utilities";
import {
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
} from "@/modules/customer-reviews/constants";
import { PropertyValueTypes } from "@/modules/quotes/api/graphql/types";
import { ProductTitledBlock, Vendor } from "@/shared/catalog";
import type { Product, Property } from "@/core/api/graphql/types";
import ProductRating from "@/modules/customer-reviews/components/product-rating.vue";

interface IProps {
  product: Product;
  model: {
    title?: string;
    hidden?: boolean;
  };
}

const props = defineProps<IProps>();

const { themeContext } = useThemeContext();
const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
const productReviewsEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);

const properties = computed(() =>
  Object.values(getPropertiesGroupedByName(props.product.properties ?? [], PropertyType.Product)),
);

const showVendor = computed(
  () => themeContext.value?.settings?.vendor_enabled && !props.product.hasVariations && props.product.vendor,
);
const showPropertiesBlock = computed(() => !props.model.hidden && (properties.value.length || showVendor.value));

function isHTML(property: Property): boolean {
  return (property.propertyValueType as PropertyValueTypes) === PropertyValueTypes.Html;
}
</script>
