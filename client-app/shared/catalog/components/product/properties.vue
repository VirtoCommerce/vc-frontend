<template>
  <div class="properties">
    <ProductTitledBlock
      v-if="showPropertiesBlock"
      :title="model.title || $t('shared.catalog.product_details.technical_specs_block_title')"
      icon="adjustments"
      class="properties"
    >
      <template #after>
        <VcButton
          v-if="groupedProperties.length > 1"
          color="secondary"
          size="xs"
          variant="outline"
          @click="toggleWidgets"
        >
          {{ allExpanded ? $t("common.buttons.show_less") : $t("common.buttons.expand_all") }}
        </VcButton>
      </template>

      <div class="properties__groups">
        <VcWidget
          v-for="(item, index) in groupedProperties"
          :key="index"
          size="xs"
          collapsible
          :collapsed="collapsedStates[index]"
          :shadow="false"
          @toggle-collapse="($event) => (collapsedStates[index] = $event)"
        >
          <template v-if="item.group" #title>
            <span class="normal-case">
              {{ item.group?.name }}
            </span>
          </template>

          <div class="properties__group">
            <VcCollapsibleContent :max-height="groupedProperties.length === 1 ? '18.75rem' : 'none'">
              <div v-for="property in item.properties" :key="property.id" class="properties__prop">
                <div class="properties__label">
                  {{ property.label }}
                </div>

                <div class="properties__value">
                  <span v-if="isHTML(property)">
                    <VcMarkdownRender :src="String(property.value)" />
                  </span>

                  <span v-else>
                    {{ property.value }}
                  </span>
                </div>
              </div>
            </VcCollapsibleContent>
          </div>
        </VcWidget>
      </div>
    </ProductTitledBlock>

    <div class="mt-5 space-y-4">
      <!-- Rating -->
      <VcProperty
        v-if="productReviewsEnabled && product.rating"
        :label="$t('shared.catalog.product_card.product_rating')"
        class="text-base"
      >
        <ProductRating :rating="product.rating" />
      </VcProperty>

      <!-- Vendor -->
      <VcProperty v-if="showVendor" :label="$t('shared.catalog.product_details.vendor_label')" class="text-base">
        <Vendor :vendor="product.vendor!" with-rating />
      </VcProperty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { PropertyType } from "@/core/api/graphql/types";
import { useThemeContext } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { getPropertiesGroupedByName, getGroupedAndSortedProperties } from "@/core/utilities";
import {
  MODULE_ID as CUSTOMER_REVIEWS_MODULE_ID,
  ENABLED_KEY as CUSTOMER_REVIEWS_ENABLED_KEY,
} from "@/modules/customer-reviews/constants";
import { PropertyValueTypes } from "@/modules/quotes/api/graphql/types";
import { ProductTitledBlock, Vendor } from "@/shared/catalog";
import type { Product, Property } from "@/core/api/graphql/types";
import ProductRating from "@/modules/customer-reviews/components/product-rating.vue";

interface IProps {
  product: Product;
  model: {
    title?: string;
    hidden?: boolean;
  };
}

const props = defineProps<IProps>();

const collapsedStates = ref<boolean[]>([]);

const { themeContext } = useThemeContext();
const { isEnabled } = useModuleSettings(CUSTOMER_REVIEWS_MODULE_ID);
const productReviewsEnabled = isEnabled(CUSTOMER_REVIEWS_ENABLED_KEY);

const properties = computed(() =>
  Object.values(getPropertiesGroupedByName(props.product.properties ?? [], PropertyType.Product)),
);

const groupedProperties = computed(() => getGroupedAndSortedProperties(properties.value));

const showVendor = computed(
  () => themeContext.value?.settings?.vendor_enabled && !props.product.hasVariations && props.product.vendor,
);
const showPropertiesBlock = computed(() => !props.model.hidden && (properties.value.length || showVendor.value));

const allExpanded = computed(() => collapsedStates.value.every((val) => val === false));

function toggleWidgets() {
  if (!allExpanded.value) {
    collapsedStates.value = groupedProperties.value.map(() => false);
  } else {
    collapsedStates.value = groupedProperties.value.map((_, index) => index !== 0);
  }
}

function initCollapsedStates() {
  collapsedStates.value = groupedProperties.value.map((_, index) => index !== 0);
}

function isHTML(property: Property): boolean {
  return (property.propertyValueType as PropertyValueTypes) === PropertyValueTypes.Html;
}

onMounted(() => {
  initCollapsedStates();
});
</script>

<style lang="scss">
.properties {
  &__groups {
    @apply space-y-3;
  }

  &__prop {
    @apply flex items-stretch text-sm rounded even:bg-neutral-100;
  }

  &__label {
    @apply flex-none w-32 py-2.5 ps-2 text-neutral-600 break-words;
  }

  &__value {
    @apply grow py-2.5 px-2 text-neutral-950;

    word-break: break-word;
  }
}
</style>
