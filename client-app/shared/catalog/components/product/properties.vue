<template>
  <ProductTitledBlock
    v-if="!model.hidden"
    class="mt-5"
    image-src="/static/images/technical_specs.svg"
    :title="model.title || $t('shared.catalog.product_details.technical_specs_block_title')"
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

    <a
      v-if="groupedProperties && groupedProperties.length > MAX_DISPLAY_ITEMS"
      class="mb-4 flex items-center gap-x-1 text-14 text-[color:var(--color-link)] underline decoration-dashed hover:cursor-pointer hover:text-[color:var(--color-link-hover)]"
      @click="showAll = !showAll"
    >
      <VcIcon :name="showAll ? 'chevron-up' : 'chevron-down'" size="xs" class="text-[color:var(--color-primary)]" />
      {{ showAll ? $t("common.buttons.see_less") : $t("common.buttons.see_more") }}
    </a>
  </ProductTitledBlock>
</template>

<script setup lang="ts">
import _ from "lodash";
import { computed, ref } from "vue";
import { prepareProperties, ProductProperty, ProductTitledBlock, Vendor } from "@/shared/catalog";
import { Product } from "@/xapi";

const props = defineProps<Props>();
const MAX_DISPLAY_ITEMS = 8;
const showAll = ref(false);

interface Props {
  product: Product;
  model: {
    hidden: boolean;
    title: string;
  };
}

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
