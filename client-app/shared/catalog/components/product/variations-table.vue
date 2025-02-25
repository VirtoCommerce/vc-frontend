<template>
  <div class="variations-table">
    <VcTable
      :items="variations"
      :columns="columns"
      :sort="sort"
      :loading="fetching"
      :page="pageNumber"
      :pages="pagesCount"
      :hide-default-footer="!pagesCount"
      @header-click="applySorting"
      @page-changed="changePage"
    >
      <template #desktop-skeleton>
        <tr v-for="rowIndex in 5" :key="rowIndex" class="variations-table__row even:bg-neutral-50">
          <td v-for="columnIndex in columns.length" :key="columnIndex" class="p-5">
            <div class="h-6 animate-pulse bg-neutral-200" />
          </td>
        </tr>
      </template>

      <template #desktop-body>
        <tr v-for="(variation, variationIndex) in variations" :key="variation.code" class="variations-table__row">
          <td class="variations-table__col variations-table__col--title">
            <VcProductTitle :lines-number="2">
              {{ variation.name }}
            </VcProductTitle>
          </td>

          <td
            v-for="(property, index) in productProperties"
            :key="index"
            class="variations-table__col variations-table__col--property"
          >
            {{ property.values[variationIndex] }}
          </td>

          <td class="variations-table__col variations-table__col--in-stock">
            <VcChip
              v-if="variation.availabilityData?.isInStock"
              color="success"
              size="xs"
              variant="outline-dark"
              class="variations-table__chip"
              truncate
              rounded
            >
              <template v-if="variation.availabilityData?.availableQuantity > 0">
                {{ getStockQuantity(variation) }}
              </template>

              <template v-else>
                {{ $t("common.labels.in_stock") }}
              </template>
            </VcChip>

            <VcChip
              v-else
              size="xs"
              variant="outline-dark"
              color="danger"
              class="variations-table__chip"
              truncate
              rounded
            >
              0
            </VcChip>
          </td>

          <td class="variations-table__col variations-table__col--price">
            <VcProductPrice :list-price="variation.price.list" :actual-price="variation.price.actual" align="end" />
          </td>

          <td class="variations-table__col variations-table__col--quantity">
            <VcAddToCart
              :model-value="mappedLineItems[variation.id]?.quantity ?? 0"
              :name="variation.id"
              :disabled="
                !variation.availabilityData?.isInStock ||
                !variation.availabilityData?.isAvailable ||
                !variation.availabilityData?.isBuyable
              "
              :error="!!getItemErrors(variation)"
              hide-button
              :timeout="DEFAULT_DEBOUNCE_IN_MS"
              :validate-on-mount="false"
              :pack-size="variation.packSize"
              :min-quantity="variation.minQuantity"
              :max-quantity="variation.maxQuantity"
              :available-quantity="variation.availabilityData?.availableQuantity"
              :is-in-stock="variation.availabilityData?.isInStock"
              :is-active="variation.availabilityData?.isActive"
              :is-available="variation.availabilityData?.isAvailable"
              :is-buyable="variation.availabilityData?.isBuyable"
              @update:model-value="changeCart(variation, $event)"
              @update:validation="handleClientValidation(variation.id, $event)"
            >
              <template v-if="!!getItemErrors(variation)" #append>
                <VcTooltip placement="bottom-end">
                  <template #trigger>
                    <VcIcon class="variations-table__quantity-icon" name="warning" />
                  </template>

                  <template #content>
                    <div class="w-max rounded-sm bg-additional-50 px-3.5 py-1.5 text-xs text-danger">
                      <div v-for="(error, index) in getItemErrors(variation)" :key="index">
                        {{ error }}
                      </div>
                    </div>
                  </template>
                </VcTooltip>
              </template>
            </VcAddToCart>

            <CountInCart :product-id="variation.id" class="variations-table__in-cart" />
          </td>
        </tr>
      </template>
    </VcTable>
  </div>
</template>

<script setup lang="ts">
import { flatten, sortBy, uniqBy } from "lodash";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { PropertyType } from "@/core/api/graphql/types";
import { useErrorsTranslator, useHistoricalEvents } from "@/core/composables";
import { useAnalyticsUtils } from "@/core/composables/useAnalyticsUtils";
import { MAX_DISPLAY_IN_STOCK_QUANTITY } from "@/core/constants";
import { getPropertyValue, getPropertiesGroupedByName } from "@/core/utilities";
import { DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart";
import { useShortCart } from "@/shared/cart/composables";
import CountInCart from "../count-in-cart.vue";
import type { Product, ShortLineItemFragment, ValidationErrorType } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";

interface IEmits {
  (event: "applySorting", item: ISortInfo): void;
  (event: "changePage", page: number): void;
}

interface IProps {
  variations: Product[];
  sort: ISortInfo;
  fetching: boolean;
  pageNumber?: number;
  pagesCount?: number;
}

interface IProductProperties {
  name: string;
  label: string;
  values: string[];
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { t } = useI18n();
const { cart, addToCart, changeItemQuantity } = useShortCart();
const { localizedItemsErrors: serverValidationErrors, setErrors } =
  useErrorsTranslator<ValidationErrorType>("validation_error");
const { trackAddItemToCart } = useAnalyticsUtils();
const { pushHistoricalEvent } = useHistoricalEvents();

const clientValidation = ref<Record<string, { isValid: boolean; messages?: string[] }>>({});

const variations = computed(() => props.variations);
const productProperties = computed<IProductProperties[]>(() => {
  const properties: IProductProperties[] = [];

  const propertiesCombined = flatten(variations.value.map((variation) => getProperties(variation)));

  const names = uniqBy(
    propertiesCombined.map((prop) => {
      return {
        name: prop.name,
        label: prop.label,
      };
    }),
    "name",
  );

  names.forEach(({ name, label }) => {
    properties.push({
      name,
      label,
      values: variations.value.map((variation) => {
        const property = variation.properties.find((item) => item.name === name);
        return property ? (getPropertyValue(property) ?? "\u2013") : "\u2013";
      }),
    });
  });

  return properties;
});

const propertiesTitles = computed<ITableColumn[]>(() =>
  productProperties.value.map((item) => ({
    id: item.name,
    title: item.label,
    sortable: true,
    align: "center",
    classes: "min-w-24 w-24 break-words",
  })),
);

const columns = computed<ITableColumn[]>(() => [
  {
    id: "name",
    title: t("shared.catalog.product_details.variations.columns.item"),
    sortable: true,
    classes: "min-w-52",
  },
  ...propertiesTitles.value,
  {
    id: "instock_quantity",
    title: t("shared.catalog.product_details.variations.columns.stock"),
    align: "center",
    sortable: true,
    classes: "min-w-[4.375rem] w-[4.375rem]",
  },
  {
    id: "price",
    title: t("shared.catalog.product_details.variations.columns.price"),
    align: "right",
    sortable: true,
    classes: "min-w-32 w-32",
  },
  {
    id: "quantity",
    title: t("shared.catalog.product_details.variations.columns.quantity"),
    align: "center",
    classes: "min-w-32 w-32",
  },
]);

const mappedLineItems = computed(() => {
  const mapped: Record<string, ShortLineItemFragment | undefined> = {};
  variations.value?.forEach((variation) => (mapped[variation.id] = getLineItem(variation)));
  return mapped;
});

function getStockQuantity(variation: Product) {
  return variation.availabilityData.availableQuantity &&
    variation.availabilityData.availableQuantity > MAX_DISPLAY_IN_STOCK_QUANTITY
    ? `${MAX_DISPLAY_IN_STOCK_QUANTITY}+`
    : variation.availabilityData.availableQuantity!.toString();
}

function getProperties(variation: Product) {
  return Object.values(
    getPropertiesGroupedByName(sortBy(variation.properties, ["displayOrder", "name"]) ?? [], PropertyType.Variation),
  );
}

function getLineItem(variation: Product): ShortLineItemFragment | undefined {
  return cart.value?.items?.find((item) => item.productId === variation.id);
}

function getItemErrors(variation: Product) {
  if (clientValidation.value[variation.id]?.isValid === false) {
    return clientValidation.value[variation.id]?.messages;
  }

  if (serverValidationErrors.value[variation.id]) {
    return serverValidationErrors.value[variation.id];
  }

  const lineItem = getLineItem(variation);
  if (lineItem?.id) {
    return serverValidationErrors.value[lineItem.id];
  }
}

async function changeCart(variation: Product, quantity: number) {
  if (!clientValidation.value[variation.id]?.isValid) {
    return;
  }
  const lineItem = getLineItem(variation);

  if (lineItem) {
    await changeItemQuantity(lineItem.id, quantity);
  } else {
    await addToCart(variation.id, quantity);
    trackAddItemToCart(variation, quantity);
    void pushHistoricalEvent({ eventType: "addToCart", productId: variation.id });
  }
}

function applySorting(sortInfo: ISortInfo): void {
  emit("applySorting", sortInfo);
}

function changePage(page: number): void {
  emit("changePage", page);
}

function handleClientValidation(id: string, validation: { isValid: true } | { isValid: false; errorMessage: string }) {
  if (!validation.isValid) {
    clientValidation.value[id] = { isValid: false, messages: [validation.errorMessage] };
  } else {
    clientValidation.value[id] = { isValid: true };
  }
}

watchEffect(() => {
  if (cart.value?.validationErrors) {
    setErrors(cart.value?.validationErrors);
  }
});
</script>

<style lang="scss">
.variations-table {
  @apply overflow-x-auto rounded border;

  &__row {
    @apply even:bg-neutral-50 hover:bg-neutral-100;
  }

  &__col {
    &--title {
      @apply py-2.5 ps-4;
    }

    &--property {
      @apply px-2 py-2.5 text-center break-words;
    }

    &--in-stock {
      @apply px-2 py-3;
    }

    &--price {
      @apply p-3;
    }

    &--quantity {
      @apply p-3;
    }
  }

  &__chip {
    @apply w-full;
  }

  &__quantity-icon {
    @apply me-3 size-4 fill-danger;
  }

  &__in-cart {
    @apply mt-1.5;
  }
}
</style>
