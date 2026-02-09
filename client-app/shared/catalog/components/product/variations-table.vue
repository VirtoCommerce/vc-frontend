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
      bordered
      scrollable
      @header-click="applySorting"
      @page-changed="changePage"
    >
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
            <VcBadge
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
            </VcBadge>

            <VcBadge
              v-else
              size="xs"
              variant="outline-dark"
              color="danger"
              class="variations-table__chip"
              truncate
              rounded
            >
              0
            </VcBadge>
          </td>

          <td class="variations-table__col variations-table__col--price">
            <VcProductPrice :list-price="variation.price.list" :actual-price="variation.price.actual" align="end" />
          </td>

          <td class="variations-table__col variations-table__col--quantity">
            <ExtensionPoint
              :name="EXTENSION_NAMES.productPage.variationItemButton"
              category="productPage"
              :product="variation"
              v-if="$canRenderExtensionPoint('productPage', EXTENSION_NAMES.productPage.variationItemButton, variation)"
            />

            <AddToCartSimple v-else :product="variation">
              <CountInCart :product-id="variation.id" />
            </AddToCartSimple>
          </td>
        </tr>
      </template>
    </VcTable>
  </div>
</template>

<script setup lang="ts">
import { flatten, sortBy, uniqBy } from "lodash";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { PropertyType } from "@/core/api/graphql/types";
import { MAX_DISPLAY_IN_STOCK_QUANTITY } from "@/core/constants";
import { getPropertyValue, getPropertiesGroupedByName } from "@/core/utilities";
import { EXTENSION_NAMES } from "@/shared/common/constants";
import CountInCart from "../count-in-cart.vue";
import type { Product } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";
import AddToCartSimple from "@/shared/cart/components/add-to-cart-simple.vue";

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
    classes: "min-w-[10.25rem] w-[10.25rem]",
  },
]);

function getStockQuantity(variation: Product) {
  return variation.availabilityData.availableQuantity &&
    variation.availabilityData.availableQuantity > MAX_DISPLAY_IN_STOCK_QUANTITY
    ? `${MAX_DISPLAY_IN_STOCK_QUANTITY}+`
    : variation.availabilityData.availableQuantity.toString();
}

function getProperties(variation: Product) {
  return Object.values(
    getPropertiesGroupedByName(sortBy(variation.properties, ["displayOrder", "name"]) ?? [], PropertyType.Variation),
  );
}

function applySorting(sortInfo: ISortInfo): void {
  emit("applySorting", sortInfo);
}

function changePage(page: number): void {
  emit("changePage", page);
}
</script>

<style lang="scss">
.variations-table {
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
