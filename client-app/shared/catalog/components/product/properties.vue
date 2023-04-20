<template>
  <ProductTitledBlock
    v-if="showPropertiesBlock"
    :title="model.title || $t('shared.catalog.product_details.technical_specs_block_title')"
    image-src="/static/images/technical_specs.svg"
  >
    <!-- Properties -->
    <ProductProperty v-for="property in displayedProperties" :key="property.name" :label="property.label!" class="mb-4">
      {{ property.value }}
    </ProductProperty>

    <!-- Vendor -->
    <ProductProperty v-if="showVendor" :label="$t('shared.catalog.product_details.vendor_label')" class="mb-4">
      <Vendor :vendor="product.vendor!" with-rating />
    </ProductProperty>

    <div v-if="allProperties.length > MAX_DISPLAY_ITEMS" class="-mt-1 mb-4">
      <VcButtonSeeMoreLess v-model="showAll" />
    </div>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { PropertyType } from "@/core/enums";
import { configInjectionKey } from "@/core/injection-keys";
import { getPropertiesGroupedByName } from "@/core/utilities";
import { ProductProperty, ProductTitledBlock, Vendor } from "@/shared/catalog";
import type { Product } from "@/xapi/types";

interface IProps {
  product: Product;
  model: {
    title?: string;
    hidden?: boolean;
  };
}

const props = defineProps<IProps>();

const config = inject(configInjectionKey, {});

const MAX_DISPLAY_ITEMS = 8;

const showAll = ref(false);

const allProperties = computed(() =>
  Object.values(getPropertiesGroupedByName(props.product.properties ?? [], PropertyType.Product))
);

const displayedProperties = computed(() =>
  showAll.value ? allProperties.value : allProperties.value.slice(0, MAX_DISPLAY_ITEMS)
);

const showVendor = computed(() => config.vendor_enabled && !props.product.hasVariations && props.product.vendor);
const showPropertiesBlock = computed(() => !props.model.hidden && (allProperties.value.length || showVendor.value));
</script>
