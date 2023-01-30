<template>
  <ProductTitledBlock
    class="mt-5"
    v-if="!model.hidden"
    image-src="/static/images/technical_specs.svg"
    :title="model.title || $t('shared.catalog.product_details.technical_specs_block_title')"
  >
    <!-- Properties -->
    <ProductProperty v-for="property in propertiesToShow" :key="property.name" :label="property.name" class="mb-4">
      {{ property.values }}
    </ProductProperty>

    <a
      v-if="product.properties && product.properties.length > MAX_DISPLAY_ITEMS"
      class="my-0.5 !h-10 text-14 text-blue-600 dark:text-blue-500 underline hover:cursor-pointer decoration-dashed"
      @click="showAll = !showAll"
    >
      <i
        class="fas text-[1rem] text-[color:var(--color-primary)] lg:text-[0.625rem]"
        :class="[showAll ? 'fa-chevron-up' : 'fa-chevron-down']"
      />
      {{
        showAll == true ? $t("shared.catalog.product_details.see_less") : $t("shared.catalog.product_details.see_more")
      }}
    </a>

    <!-- Vendor -->
    <ProductProperty
      v-if="$cfg.vendor_enabled && !product.hasVariations && product.vendor"
      :label="$t('shared.catalog.product_details.vendor_label')"
      class="mb-4"
    >
      <Vendor :vendor="product.vendor" withRating />
    </ProductProperty>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import _ from "lodash";
import { Product } from "@/xapi/types";
import { prepareProperties, ProductProperty, ProductTitledBlock, Vendor } from "@/shared/catalog";

const MAX_DISPLAY_ITEMS = 8;
const showAll = ref(false);

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

const propertiesToShow = computed(() =>
  !showAll.value ? groupedProperties.value.slice(0, MAX_DISPLAY_ITEMS) : groupedProperties.value
);
</script>
