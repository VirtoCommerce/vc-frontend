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
        :browser-target="browserTarget"
        with-image
        with-price
        with-properties
        show-placed-price
      >
        <ExtensionPoint
          :name="EXTENSION_NAMES.productPage.variationItemButton"
          category="productPage"
          :product="variation"
          v-if="$canRenderExtensionPoint('productPage', EXTENSION_NAMES.productPage.variationItemButton, variation)"
        />

        <AddToCartSimple v-else :product="variation">
          <InStock
            :is-in-stock="variation.availabilityData.isInStock"
            :quantity="variation.availabilityData.availableQuantity"
          />

          <CountInCart :product-id="variation.id" />
        </AddToCartSimple>
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
import { useBrowserTarget } from "@/core/composables";
import { getPropertiesGroupedByName } from "@/core/utilities";
import { PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME } from "@/shared/catalog/constants/product";
import { EXTENSION_NAMES } from "@/shared/common/constants";
import CountInCart from "../count-in-cart.vue";
import InStock from "../in-stock.vue";
import type { Product } from "@/core/api/graphql/types";
import AddToCartSimple from "@/shared/cart/components/add-to-cart-simple.vue";

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

const { browserTarget } = useBrowserTarget();

function getProperties(variation: Product) {
  return Object.values(
    getPropertiesGroupedByName(sortBy(variation.properties, ["displayOrder", "name"]) ?? [], PropertyType.Variation),
  ).filter((property) => property.name !== PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME);
}

function changePage(page: number): void {
  emit("changePage", page);
}
</script>
