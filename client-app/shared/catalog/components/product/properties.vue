<template>
  <ProductTitledBlock
    class="mt-5"
    v-if="!model.hidden"
    image-src="/static/images/technical_specs.svg"
    :title="model.title || $t('shared.catalog.product_details.technical_specs_block_title')"
  >
    <!-- Properties -->
    <ProductProperty v-for="property in groupedProperties" :key="property.name" :label="property.name" class="mb-4">
      {{ property.values }}
    </ProductProperty>

    <!-- Vendor -->
    <ProductProperty
      v-if="product.vendor && !product.hasVariations"
      :label="$t('shared.catalog.product_details.vendor_label')"
      class="mb-4"
    >
      <span class="text-[color:var(--color-link)]">{{ product.vendor.name }}</span>
    </ProductProperty>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import _ from "lodash";
import { Product } from "@/xapi/types";
import { prepareProperties, ProductProperty, ProductTitledBlock } from "@/shared/catalog";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },

  model: {
    type: Object,
    required: true,
  },
});

// TODO: move this logic to the separated helper. For variations properties also
const groupedProperties = computed(() => {
  return _(props.product.properties)
    .filter((p) => !!p && p.type === "Product" && p.value !== undefined && p.value !== null && !p.hidden)
    .groupBy((p) => p.name)
    .map(prepareProperties)
    .value();
});
</script>
