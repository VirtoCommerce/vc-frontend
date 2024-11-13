<template>
  <VcWidget
    class="product-configuration"
    prepend-icon="adjustments"
    :title="$t('shared.catalog.product_details.product_configuration.title')"
    size="lg"
  >
    <div class="product-configuration__widgets">
      <VcWidget v-for="section in configuration" :key="section.id" collapsible size="xs">
        <template #title>
          {{ section.name }}
          <div class="product-configuration__description">
            {{ getSelectedOptionTitle(section.id!) ?? section.description }}
          </div>
        </template>

        <div class="product-configuration__items">
          <VcProductCard
            v-for="product in section.products"
            :key="product.id"
            view-mode="item"
            class="product-configuration__item"
          >
            <template #media>
              <VcRadioButton
                :value="product.id"
                :name="`selection-${section.id}`"
                @input="
                  handleInput({ sectionId: section.id!, value: { productId: product.id, quantity: section.quantity! } })
                "
              />
              <VcProductImage :img-src="product.imgSrc" :alt="product.name" />
            </template>

            <VcProductTitle :to="getProductRoute(product.id, product.slug)">{{ product.name }}</VcProductTitle>

            <VcProductProperties>
              <VcProperty
                v-for="property in product.properties.slice(0, 3)"
                :key="property.id"
                :label="property.name"
                :value="property.value"
              />
              <VcProperty class="@2xl:hidden" label="Price per item">
                <VcPriceDisplay :value="product.price.actual" />
              </VcProperty>
            </VcProductProperties>

            <VcProductPrice
              :has-variations="product.hasVariations"
              :actual-price="product.price.actual"
              :list-price="product.price.list"
            />

            <VcAddToCart hide-button disabled :model-value="section.quantity" />

            <VcProductTotal :actual-price="product.price.actual" :list-price="product.price.list" />
          </VcProductCard>

          <VcProductCard v-if="!section.isRequired" view-mode="item" class="product-configuration__item">
            <template #media>
              <VcRadioButton
                value="none"
                :name="`selection-${section.id}`"
                :model-value="selectedConfiguration[section.id!]?.productId === undefined ? 'none' : ''"
                @input="handleInput({ sectionId: section.id!, value: undefined })"
              />
              <VcProductImage />
            </template>

            <VcProductTitle :title="$t('shared.catalog.product_details.product_configuration.none')" />
          </VcProductCard>
        </div>
      </VcWidget>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { getProductRoute } from "@/core/utilities";
import { useConfigurableProduct } from "@/shared/catalog/composables";
import type { ConfigurationSectionType } from "@/core/api/graphql/types";

interface IProps {
  configuration: ConfigurationSectionType[];
  productId: string;
}

const props = defineProps<IProps>();

const configurableProductId = toRef(props, "productId");

const { selectSectionValue, selectedConfiguration } = useConfigurableProduct(configurableProductId.value);

function handleInput({ sectionId, value }: { sectionId: string; value?: { productId: string; quantity: number } }) {
  selectSectionValue({ sectionId, value });
}

function getSelectedOptionTitle(sectionId: string) {
  const selectedOption = selectedConfiguration.value[sectionId];
  console.log(selectedOption);
  return selectedConfiguration.value[sectionId]?.selectedProductTitle;
}
</script>

<style lang="scss">
.product-configuration {
  &__widgets {
    @apply space-y-5;
  }

  &__description {
    @apply mt-1 text-xs font-normal normal-case text-neutral;
  }

  &__items {
    @apply @container mt-5;

    @container (max-width: theme("containers.2xl")) {
      @apply space-y-3;
    }
  }

  &__item {
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
}
</style>
