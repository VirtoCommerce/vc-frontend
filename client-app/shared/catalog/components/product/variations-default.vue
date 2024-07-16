<template>
  <VcLineItems :with-header="false" class="variations-default">
    <template #line-items>
      <VcLineItem
        v-for="variation in variations"
        :key="variation.code"
        with-image
        with-price
        with-properties
        :image-url="variation.images[0]?.url"
        :name="variation.name"
        :properties="getProperties(variation)"
        :list-price="variation.price.list"
        :actual-price="variation.price.actual"
        :vendor="$cfg.vendor_enabled ? variation.vendor : undefined"
      >
        <AddToCart :product="variation" />

        <div class="variations-default__badges">
          <InStock
            :is-in-stock="variation.availabilityData.isInStock"
            :quantity="variation.availabilityData.availableQuantity"
          />

          <CountInCart :product-id="variation.id" />
        </div>
      </VcLineItem>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { sortBy } from "lodash";
import { PropertyType } from "@/core/api/graphql/types";
import { getPropertiesGroupedByName } from "@/core/utilities";
import { AddToCart } from "@/shared/cart";
import CountInCart from "../count-in-cart.vue";
import InStock from "../in-stock.vue";
import type { Product, VariationType } from "@/core/api/graphql/types";

interface IProps {
  variations: Product[];
}

defineProps<IProps>();

function getProperties(variation: VariationType) {
  return Object.values(
    getPropertiesGroupedByName(sortBy(variation.properties, ["displayOrder", "name"]) ?? [], PropertyType.Variation),
  );
}
</script>

<style lang="scss">
.variations-default {
  &__badges {
    @apply flex items-center flex-wrap gap-1 mt-1.5;
  }
}
</style>
