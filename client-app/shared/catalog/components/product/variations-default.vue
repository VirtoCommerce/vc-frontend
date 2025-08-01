<template>
  <VcLineItems :with-header="false" class="variations-default">
    <template #line-items>
      <VcLineItem
        v-for="variation in variations"
        :key="variation.code"
        :image-url="variation.images[0]?.url"
        :name="variation.name"
        :properties="getProperties(variation)"
        :list-price="variation.price.list"
        :actual-price="variation.price.actual"
        :vendor="$cfg.vendor_enabled ? variation.vendor : undefined"
        :browser-target="$cfg.details_browser_target"
        with-image
        with-price
        with-properties
        show-placed-price
      >
        <AddToCart :product="variation">
          <InStock
            :is-in-stock="variation.availabilityData.isInStock"
            :quantity="variation.availabilityData.availableQuantity"
          />

          <CountInCart :product-id="variation.id" />
        </AddToCart>
      </VcLineItem>

      <VcPagination
        v-if="pagesCount > 1"
        v-model:page="pageNumber"
        :pages="pagesCount"
        class="p-4"
        @update:page="changePage"
      />
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { sortBy } from "lodash";
import { toRef } from "vue";
import { PropertyType } from "@/core/api/graphql/types";
import { getPropertiesGroupedByName } from "@/core/utilities";
import { AddToCart } from "@/shared/cart";
import { PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME } from "@/shared/catalog/constants/product";
import CountInCart from "../count-in-cart.vue";
import InStock from "../in-stock.vue";
import type { Product } from "@/core/api/graphql/types";

interface IEmits {
  (event: "changePage", page: number): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  variations: Product[];
  pageNumber: number;
  pagesCount: number;
}

const pageNumber = toRef(props, "pageNumber");

function getProperties(variation: Product) {
  return Object.values(
    getPropertiesGroupedByName(sortBy(variation.properties, ["displayOrder", "name"]) ?? [], PropertyType.Variation),
  ).filter((property) => property.name !== PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME);
}

function changePage(page: number): void {
  emit("changePage", page);
}
</script>
