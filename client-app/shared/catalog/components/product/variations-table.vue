<template>
  <div class="overflow-x-auto rounded border">
    <VcTable :items="[product, ...product.variations]" :columns="columns" layout="table-fixed min-w-full w-auto">
      <template #desktop-body>
        <tr
          v-for="(variation, variationIndex) in variations"
          :key="variation.code"
          class="even:bg-neutral-50 hover:bg-neutral-100"
        >
          <td class="overflow-hidden text-ellipsis py-2.5 ps-4">
            <VcProductTitle :lines-number="2">
              {{ variation.name }}
            </VcProductTitle>
          </td>

          <td v-for="(property, index) in properties" :key="index">
            {{ property.values[variationIndex] }}
          </td>

          <td class="overflow-hidden text-ellipsis px-2 py-3">
            <VcChip
              v-if="variation.availabilityData?.isInStock"
              size="xs"
              variant="outline-dark"
              color="success"
              class="w-full"
              truncate
              rounded
            >
              {{ variation.availabilityData?.availableQuantity }}
            </VcChip>

            <VcChip v-else size="xs" variant="outline-dark" color="danger" class="w-full" truncate rounded>0</VcChip>
          </td>

          <td class="p-3">
            <VcProductPrice :list-price="variation.price.list" :actual-price="variation.price.actual" align="end" />
          </td>

          <td class="p-3">
            <VcQuantity />
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
import { getPropertyValue } from "@/core/utilities";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
}

interface ICompareProductProperties {
  label: string;
  values: string[];
}

const props = defineProps<IProps>();

const { t } = useI18n();

const properties = ref<ICompareProductProperties[]>([]);
const propTitles = ref<ITableColumn[]>([]);

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
    classes: "min-w-[4.375rem]",
  },
  {
    id: "price",
    title: t("shared.catalog.product_details.variations.columns.price"),
    align: "right",
    classes: "min-w-32",
  },
  {
    id: "quantity",
    title: t("shared.catalog.product_details.variations.columns.quantity"),
    sortable: true,
    align: "center",
    classes: "min-w-28",
  },
]);

function getProperties() {
  if (!variations.value.length) {
    return;
  }

  const propertiesCombined = _.flatten(_.map(variations.value, "properties"));
  const names = _.uniq(
    propertiesCombined.map((prop) => {
      return {
        name: prop!.name,
        label: prop!.label!,
      };
    }),
  );

  _.each(names, ({ name, label }) => {
    properties.value.push({
      label,
      values: _.map(variations.value, (variation) => {
        const property = _.find(variation.properties, ["name", name]);

        return property ? getPropertyValue(property) ?? "\u2013" : "\u2013";
      }),
    });
  });

  propTitles.value = properties.value.map((item) => ({
    id: item.label,
    title: item.label,
    sortable: true,
    align: "center",
    classes: "min-w-24",
  }));
}

onMounted(() => {
  getProperties();
});
</script>
