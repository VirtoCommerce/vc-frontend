<template>
  <div class="flex flex-row space-x-2.5 rounded-sm border border-gray-100 p-5">
    <!-- image -->
    <div class="size-12">
      <div
        v-if="variation.images?.length"
        class="square relative -ml-2 -mt-2 flex flex-col items-center justify-center"
      >
        <VcImage
          :src="variation.images[0].url"
          :alt="variation.name"
          size-suffix="sm"
          class="absolute top-0 size-full rounded-sm object-cover object-center"
          lazy
        />
      </div>
    </div>

    <!-- Description -->
    <div class="flex flex-1 flex-col">
      <!-- Name -->
      <div class="mb-2 text-base font-bold uppercase">
        {{ $t("shared.catalog.product_details.product_variation_card.variation_sku_label") }} {{ variation.code }}
      </div>
      <div class="flex flex-1 flex-col xl:flex-row xl:space-x-3">
        <div class="flex flex-1 flex-col gap-y-3 max-xl:mb-2 md:gap-y-1">
          <!-- Properties -->
          <VariationProperty v-for="property in propertiesByName" :key="property.name" :label="property.label!">
            {{ property.value }}
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
            <Vendor class="flex-wrap" :vendor="variation.vendor" with-rating />
          </VariationProperty>
        </div>

        <!-- Add to cart -->
        <div class="flex flex-1 flex-row xl:self-start print:hidden">
          <div class="w-full">
            <AddToCart :product="variation" />

            <InStock
              :is-in-stock="!!variation.availabilityData?.isInStock"
              :is-digital="isDigital"
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
import { computed } from "vue";
import { ProductType, PropertyType } from "@/core/enums";
import { getPropertiesGroupedByName } from "@/core/utilities";
import InStock from "./in-stock.vue";
import VariationProperty from "./variation-property.vue";
import Vendor from "./vendor.vue";
import type { Product, VariationType } from "@/core/api/graphql/types";
import AddToCart from "@/shared/cart/components/add-to-cart.vue";

interface IProps {
  variation: VariationType | Product;
}

const props = defineProps<IProps>();

const propertiesByName = computed(() =>
  getPropertiesGroupedByName(props.variation.properties ?? [], PropertyType.Variation),
);

const isDigital = computed<boolean>(() => props.variation.productType === ProductType.Digital);
</script>
