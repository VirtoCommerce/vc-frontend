<template>
  <div class="variations-table">
    <VcTable :items="variations" :columns="columns" layout="table-fixed min-w-full w-auto">
      <template #desktop-body>
        <tr v-for="(variation, variationIndex) in variations" :key="variation.code" class="variations-table__row">
          <td class="variations-table__col variations-table__col--title">
            <VcProductTitle :lines-number="2">
              {{ variation.name }}
            </VcProductTitle>
          </td>

          <td
            v-for="(property, index) in properties"
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
            <VcQuantity
              :model-value="getCountInCart(variation)"
              :name="variation.id"
              :disabled="
                !variation.availabilityData?.isInStock ||
                !variation.availabilityData?.isAvailable ||
                !variation.availabilityData?.isBuyable
              "
              :error="!!idErrors[variation.id]"
              @update:model-value="changeCart(variation, $event)"
            >
              <template #append>
                <VcTooltip v-if="!!idErrors[variation.id]" placement="bottom-end">
                  <template #trigger>
                    <VcIcon class="variations-table__quantity-icon" name="warning" />
                  </template>

                  <template #content>
                    <div
                      v-for="error in idErrors[variation.id]"
                      :key="error.id"
                      class="w-max px-3.5 py-1.5 text-xs text-danger"
                    >
                      {{ error.translation }}
                    </div>
                  </template>
                </VcTooltip>
              </template>
            </VcQuantity>

            <CountInCart :product-id="variation.id" class="variations-table__in-cart" />
          </td>
        </tr>
      </template>
    </VcTable>
  </div>
</template>

<script setup lang="ts">
import _ from "lodash";
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { PropertyType } from "@/core/api/graphql/types";
import { useErrorsTranslator } from "@/core/composables";
import { MAX_DISPLAY_IN_STOCK_QUANTITY } from "@/core/constants";
import { getPropertyValue, getPropertiesGroupedByName } from "@/core/utilities";
import { useShortCart } from "@/shared/cart/composables";
import CountInCart from "../count-in-cart.vue";
import type { Product, ShortLineItemFragment, VariationType } from "@/core/api/graphql/types";
import type { ErrorType } from "@/core/composables";
import type { NamedValue } from "vue-i18n";

interface IProps {
  product: Product;
}

interface IProperties {
  name: string;
  label: string;
  values: string[];
}

const props = defineProps<IProps>();

const { t } = useI18n();

const properties = ref<IProperties[]>([]);
const propTitles = ref<ITableColumn[]>([]);

const { cart, addToCart, changeItemQuantity } = useShortCart();

const variations = computed(() => [props.product, ...props.product.variations]);

const columns = computed<ITableColumn[]>(() => [
  {
    id: "item",
    title: t("shared.catalog.product_details.variations.columns.item"),
    sortable: true,
    classes: "min-w-52",
  },
  ...propTitles.value,
  {
    id: "stock",
    title: t("shared.catalog.product_details.variations.columns.stock"),
    align: "center",
    classes: "min-w-[4.375rem] w-[4.375rem]",
  },
  {
    id: "price",
    title: t("shared.catalog.product_details.variations.columns.price"),
    align: "right",
    classes: "min-w-32 w-32",
  },
  {
    id: "quantity",
    title: t("shared.catalog.product_details.variations.columns.quantity"),
    sortable: true,
    align: "center",
    classes: "min-w-32 w-32",
  },
]);

const validationErrors = computed<ErrorType[]>(() => {
  return (
    cart.value?.validationErrors.map((el) => {
      return {
        id: el.objectId,
        code: el.errorCode,
        parameters: el.errorParameters?.reduce((acc, err) => {
          acc[err.key] = err.value;
          return acc;
        }, {} as NamedValue),
        description: el.errorMessage,
      };
    }) || []
  );
});

const { idErrors } = useErrorsTranslator("validation_error", validationErrors);

function getTableProperties() {
  if (!variations.value.length) {
    return;
  }

  const propertiesCombined = _.flatten(variations.value.map((variation) => getProperties(variation)));

  const names = _.uniqBy(
    propertiesCombined.map((prop) => {
      return {
        name: prop.name,
        label: prop.label,
      };
    }),
    "name",
  );

  _.each(names, ({ name, label }) => {
    properties.value.push({
      name,
      label,
      values: _.map(variations.value, (variation) => {
        const property = _.find(variation.properties, ["name", name]);
        return property ? getPropertyValue(property) ?? "\u2013" : "\u2013";
      }),
    });
  });

  propTitles.value = properties.value.map((item) => ({
    id: item.name,
    title: item.label,
    sortable: true,
    align: "center",
    classes: "min-w-24 w-24",
  }));
}

function getCountInCart(variation: VariationType) {
  return getLineItem(variation)?.quantity || 0;
}

function getStockQuantity(variation: VariationType) {
  return variation.availabilityData.availableQuantity &&
    variation.availabilityData.availableQuantity > MAX_DISPLAY_IN_STOCK_QUANTITY
    ? `${MAX_DISPLAY_IN_STOCK_QUANTITY}+`
    : variation.availabilityData.availableQuantity!.toString();
}

function getProperties(variation: VariationType) {
  return Object.values(
    getPropertiesGroupedByName(_.sortBy(variation.properties, ["displayOrder", "name"]) ?? [], PropertyType.Variation),
  );
}

function getLineItem(variation: VariationType): ShortLineItemFragment | undefined {
  return cart.value?.items?.find((item) => item.productId === variation.id);
}

async function changeCart(variation: VariationType, quantity: number) {
  const lineItem = getLineItem(variation);

  if (lineItem) {
    await changeItemQuantity(lineItem.id, quantity);
  } else {
    await addToCart(variation.id, quantity);
  }
}

onMounted(() => {
  getTableProperties();
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
      @apply overflow-hidden text-ellipsis py-2.5 ps-4;
    }

    &--property {
      @apply px-4 py-2.5 text-center;
    }

    &--in-stock {
      @apply overflow-hidden text-ellipsis px-2 py-3;
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
    @apply me-3 size-4 text-danger;
  }

  &__in-cart {
    @apply mt-1.5;
  }
}
</style>
