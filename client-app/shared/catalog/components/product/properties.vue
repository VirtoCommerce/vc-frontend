<template>
  <ProductTitledBlock
    v-if="!model.hidden && product.properties?.length"
    :title="model.title || $t('shared.catalog.product_details.technical_specs_block_title')"
    image-src="/static/images/technical_specs.svg"
  >
    <!-- Properties -->
    <ProductProperty v-for="property in propertiesToShow" :key="property.name" :label="property.name" class="mb-4">
      {{ property.values }}
    </ProductProperty>

    <!-- Vendor -->
    <ProductProperty
      v-if="$cfg.vendor_enabled && !product.hasVariations && product.vendor"
      :label="$t('shared.catalog.product_details.vendor_label')"
      class="mb-4"
    >
      <Vendor :vendor="product.vendor" with-rating />
    </ProductProperty>

    <div v-if="groupedProperties.length > MAX_DISPLAY_ITEMS" class="-mt-1 mb-4">
      <VcButtonSeeMoreLess v-model="showAll" />
    </div>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import _ from "lodash";
import { computed, ref } from "vue";
import { prepareProperties, ProductProperty, ProductTitledBlock, Vendor } from "@/shared/catalog";
import type { Product } from "@/xapi/types";

interface IProps {
  product: Product;
  model: {
    title?: string;
    hidden?: boolean;
  };
}

const props = defineProps<IProps>();

const MAX_DISPLAY_ITEMS = 8;

const showAll = ref(false);

// TODO: move this logic to the separated helper. For variations properties also
const groupedProperties = computed(() => {
  return _(props.product.properties)
    .filter((p) => !!p && p.type === "Product" && p.value !== undefined && p.value !== null && !p.hidden)
    .groupBy((p) => p.name)
    .map(prepareProperties)
    .value();
});

const propertiesToShow = computed(() =>
  showAll.value ? groupedProperties.value : groupedProperties.value.slice(0, MAX_DISPLAY_ITEMS)
);
</script>
