<template>
  <div class="flex flex-row space-x-2.5 border border-gray-100 rounded-sm p-5">
    <!-- image -->
    <div class="w-12 h-12">
      <div
        v-if="variation.images?.length"
        class="-mt-2 -ml-2 square relative flex flex-col justify-center items-center"
      >
        <VcImage
          :src="variation.images[0].url"
          :alt="variation.name"
          size-suffix="sm"
          class="absolute top-0 w-full h-full object-cover object-center rounded-sm"
          lazy
        />
      </div>
    </div>

    <!-- Description -->
    <div class="flex-1 flex flex-col">
      <!-- Name -->
      <div class="text-base font-bold uppercase mb-2">
        {{ $t("shared.catalog.product_details.product_variation_card.variation_sku_label") }}{{ variation.code }}
      </div>
      <div class="flex-1 flex flex-col xl:flex-row xl:space-x-3">
        <div class="flex-1 flex flex-col gap-y-3 md:gap-y-1 max-xl:mb-2">
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
            <Vendor :vendor="variation.vendor" withRating />
          </VariationProperty>
        </div>

        <!-- Add to cart -->
        <div class="flex-1 xl:self-start flex flex-row">
          <div class="w-full">
            <AddToCart :product="variation" />

            <VcInStock
              :is-in-stock="variation.availabilityData?.isInStock"
              :quantity="variation.availabilityData?.availableQuantity"
              class="inline-block mt-2.5"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import _ from "lodash";
import { Product, VariationType } from "@/xapi/types";
import { prepareProperties, VariationProperty, Vendor } from "@/shared/catalog";
import { AddToCart } from "@/shared/cart";

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
