<template>
  <VcProductCard view-mode="item" class="configuration-option-product">
    <template #media>
      <VcRadioButton
        :model-value="modelValue"
        :value="product.id"
        :name="name"
        @input="$emit('input', quantity ?? 1)"
      />
      <VcProductImage :img-src="product.imgSrc" :alt="product.name" />
    </template>

    <VcProductTitle :to="getProductRoute(product.id, product.slug)">
      {{ product.name }}
    </VcProductTitle>

    <VcProductProperties>
      <VcProperty
        v-for="property in getProperties(product.properties)"
        :key="property.id"
        :label="property.name"
        :value="property.value"
      />

      <VcProperty class="@2xl:hidden" :label="$t('common.labels.price_per_item')">
        <VcPriceDisplay :value="listPrice" />
      </VcProperty>
    </VcProductProperties>

    <VcProductPrice :has-variations="product.hasVariations" :actual-price="salePrice" :list-price="listPrice" />

    <VcAddToCart hide-button disabled :model-value="quantity ?? 1" />
    <VcProductTotal :quantity="quantity" :actual-price="extendedPrice" />
  </VcProductCard>
</template>

<script setup lang="ts">
import { PropertyType } from "@/core/api/graphql/types";
import { getProductRoute, getPropertiesGroupedByName } from "@/core/utilities";
import type { Product, MoneyType, Property } from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

defineEmits<IEmits>();
defineProps<IProps>();

const PRODUCT_PROPERTY_LIMIT = 3;

interface IProps {
  product: DeepReadonly<Product>;
  quantity?: number;
  listPrice: MoneyType;
  salePrice: MoneyType;
  extendedPrice: MoneyType;
  modelValue?: string;
  name: string;
}

interface IEmits {
  (e: "input", value: number): void;
}

function getProperties(properties: DeepReadonly<Property[]>) {
  return Object.values(getPropertiesGroupedByName(properties as Property[], PropertyType.Product)).slice(
    PRODUCT_PROPERTY_LIMIT,
  );
}
</script>

<style lang="scss">
.configuration-option-product {
  @container (max-width: theme("containers.2xl")) {
    @apply border rounded;
  }

  @container (min-width: theme("containers.2xl")) {
    &:nth-child(odd) {
      @apply bg-neutral-50;
    }

    &:first-child {
      @apply rounded-t;
    }

    &:last-child {
      @apply rounded-b;
    }
  }
}
</style>
