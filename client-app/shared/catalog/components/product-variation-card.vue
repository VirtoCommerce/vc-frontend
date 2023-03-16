<template>
  <div class="flex flex-row space-x-2.5 rounded-sm border border-gray-100 p-5">
    <!-- image -->
    <div class="h-12 w-12">
      <div
        v-if="variation.images?.length"
        class="square relative -mt-2 -ml-2 flex flex-col items-center justify-center"
      >
        <VcImage
          :src="variation.images[0].url"
          :alt="variation.name"
          size-suffix="sm"
          class="absolute top-0 h-full w-full rounded-sm object-cover object-center"
          lazy
        />
      </div>
    </div>

    <!-- Description -->
    <div class="flex flex-1 flex-col">
      <!-- Name -->
      <div class="mb-2 text-base font-bold uppercase">
        {{ $t("shared.catalog.product_details.product_variation_card.variation_sku_label") }}{{ variation.code }}
      </div>
      <div class="flex flex-1 flex-col xl:flex-row xl:space-x-3">
        <div class="flex flex-1 flex-col gap-y-3 max-xl:mb-2 md:gap-y-1">
          <!-- Properties -->
          <VariationProperty v-for="property in groupedProperties" :key="property.name" :label="property.name">
            {{ property.values }}
          </VariationProperty>

          <!-- Price -->
          <VariationProperty :label="$t('shared.catalog.product_details.product_variation_card.price_label')">
            <VcItemPrice :value="variation.price" />
          </VariationProperty>

          <!-- Vendor -->
          <VariationProperty
            v-if="$cfg.vendor_enabled && variation.vendor"
            :label="$t('shared.catalog.product_details.product_variation_card.vendor_label')"
          >
            <Vendor :vendor="variation.vendor" with-rating />
          </VariationProperty>
        </div>

        <!-- Add to cart -->
        <div class="flex flex-1 flex-row xl:self-start">
          <div class="w-full">
            <AddToCart :product="variation" />

            <VcInStock
              :is-in-stock="variation.availabilityData?.isInStock"
              :quantity="variation.availabilityData?.availableQuantity"
              class="mt-2.5 inline-block"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from "lodash";
import { computed } from "vue";
import { AddToCart } from "@/shared/cart";
import { prepareProperties, VariationProperty, Vendor } from "@/shared/catalog";
import type { Product, VariationType } from "@/xapi/types";
import type { PropType } from "vue";

const props = defineProps({
  variation: {
    type: Object as PropType<VariationType | Product>,
    required: true,
  },
});

// TODO: move this logic to the separated helper. For product properties also
const groupedProperties = computed(() => {
  return _(props.variation.properties)
    .filter((p) => !!p && p.type === "Variation" && p.value !== undefined && p.value !== null && !p.hidden)
    .groupBy((p) => p.name)
    .map(prepareProperties)
    .value();
});
</script>
