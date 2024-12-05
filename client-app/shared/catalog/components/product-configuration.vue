<template>
  <VcWidget
    class="product-configuration"
    prepend-icon="adjustments"
    :title="$t('shared.catalog.product_details.product_configuration.title')"
    size="lg"
  >
    <div id="product-configuration-anchor" />
    <div class="product-configuration__widgets">
      <VcWidget
        v-for="(section, index) in configuration"
        :key="section.id"
        collapsible
        size="xs"
        :collapsed="index !== 0"
      >
        <template #title>
          {{ section.name }}
          <div v-if="section.description" class="product-configuration__description">
            {{ section.description }}
          </div>
          <div class="product-configuration__subtitle">
            {{ getSectionSubtitle(section) }}
          </div>
        </template>

        <div v-if="section.options?.length" class="product-configuration__items">
          <template v-for="{ id, product, quantity, listPrice, salePrice, extendedPrice } in section.options" :key="id">
            <VcProductCard v-if="!!product" view-mode="item" class="product-configuration__item">
              <template #media>
                <VcRadioButton
                  :model-value="selectedConfiguration[section.id]?.productId"
                  :value="product.id"
                  :name="`selection-${section.id}`"
                  @input="
                    handleInput({
                      sectionId: section.id,
                      value: { productId: product.id, quantity: quantity ?? 1 },
                    })
                  "
                />
                <VcProductImage :img-src="product.imgSrc" :alt="product.name" />
              </template>
              <VcProductTitle :to="getProductRoute(product.id, product.slug)">{{ product.name }}</VcProductTitle>

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

              <VcProductPrice
                :has-variations="product.hasVariations"
                :actual-price="salePrice"
                :list-price="listPrice"
              />

              <VcAddToCart hide-button disabled :model-value="quantity ?? 1" />
              <VcProductTotal :quantity="quantity" :actual-price="extendedPrice" />
            </VcProductCard>
          </template>

          <VcProductCard v-if="!section.isRequired" view-mode="item" class="product-configuration__item">
            <template #media>
              <VcRadioButton
                value="none"
                :name="`selection-${section.id}`"
                :model-value="selectedConfiguration[section.id]?.productId === undefined ? 'none' : ''"
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
import { useI18n } from "vue-i18n";
import { PropertyType } from "@/core/api/graphql/types";
import { getProductRoute, getPropertiesGroupedByName } from "@/core/utilities";
import { useConfigurableProduct } from "@/shared/catalog/composables";
import type { ConfigurationSectionInput, ConfigurationSectionType, Property } from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

const props = defineProps<IProps>();

const PRODUCT_PROPERTY_LIMIT = 3;

interface IProps {
  configuration: DeepReadonly<ConfigurationSectionType[]>;
  productId: string;
}

const configurableProductId = toRef(props, "productId");

const { t } = useI18n();
const { selectSectionValue, selectedConfiguration } = useConfigurableProduct(configurableProductId.value);

function handleInput({ sectionId, value }: ConfigurationSectionInput) {
  selectSectionValue({ sectionId, value });
}
function getSectionSubtitle(section: DeepReadonly<ConfigurationSectionType>) {
  return (
    selectedConfiguration.value?.[section.id]?.selectedProductTitle ??
    t("shared.catalog.product_details.product_configuration.nothing_selected")
  );
}
function getProperties(properties: DeepReadonly<Property[]>) {
  return Object.values(getPropertiesGroupedByName(properties as Property[], PropertyType.Product)).slice(
    0,
    PRODUCT_PROPERTY_LIMIT,
  );
}
</script>

<style lang="scss">
.product-configuration {
  &__widgets {
    @apply space-y-5;
  }

  &__description,
  &__subtitle {
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
