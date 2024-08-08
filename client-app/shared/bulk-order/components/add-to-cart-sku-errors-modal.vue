<template>
  <VcModal :title="$t('shared.bulk_order.add_to_cart_sku_errors_modal.title')" class="p-6" variant="warn">
    <div class="p-6">
      <p>
        {{ $t("shared.bulk_order.add_to_cart_sku_errors_modal.common_message") }}
      </p>

      <p v-if="duplicateSkuItems?.length">
        {{ $t("shared.bulk_order.add_to_cart_sku_errors_modal.duplicate_skus_message") }}
      </p>

      <table class="w-full table-auto">
        <thead>
          <tr>
            <th>
              {{ $t("shared.bulk_order.add_to_cart_sku_errors_modal.content.sku") }}
            </th>
            <th>
              {{ $t("shared.bulk_order.add_to_cart_sku_errors_modal.content.products") }}
            </th>
            <th class="text-center">
              {{ $t("shared.bulk_order.add_to_cart_sku_errors_modal.content.quantity") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Duplicate SKU errors -->
          <tr v-for="duplicateSkuItem in duplicateSkuItems" :key="duplicateSkuItem.sku">
            <td>
              {{ duplicateSkuItem.sku }}
            </td>
            <td>
              <VcSelect
                v-model="duplicateSkuItem.productId"
                :items="duplicateSkuItem.products"
                :placeholder="$t('common.labels.select_product')"
                text-field="name"
                value-field="id"
              />
            </td>
            <td class="text-center">
              {{ duplicateSkuItem.quantity }}
            </td>
          </tr>

          <!-- Other SKU errors -->
          <tr v-for="errorItem in otherErrorItems" :key="errorItem.productSku">
            <td>
              {{ errorItem.productSku }}
            </td>
            <td colspan="2">
              {{ $t("errorItem.errors[0].errorCode") }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template v-if="duplicateSkuItems?.length" #actions>
      <VcButton :disabled="!isValid" class="mx-auto" @click="$emit('confirm', duplicateSkuItems)">
        {{ $t("common.buttons.add_items_to_cart") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef, toRef } from "vue";
import { useProducts } from "@/shared/catalog";
import type { DuplicateSkuProductType } from "../types";
import type { OutputBulkItemType } from "@/shared/cart";

interface IEmits {
  (event: "confirm", items: DuplicateSkuProductType[]): void;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  errorItems: OutputBulkItemType[];
}

const { products, fetchProducts } = useProducts();

const PRODUCT_DUPLICATE_SKU_ID = "PRODUCT_DUPLICATE_SKU";

const errorItems = toRef(props, "errorItems");

const duplicateSkuItems = shallowRef<DuplicateSkuProductType[]>();
const otherErrorItems = shallowRef<OutputBulkItemType[]>(
  errorItems.value.filter((item) => item.errors?.some((error) => error.errorCode !== PRODUCT_DUPLICATE_SKU_ID)),
);

function getDuplicateProductIds(items: OutputBulkItemType[]): string[] {
  const productIds: string[] = [];

  items.forEach((item) => {
    item.errors?.forEach((error) => {
      error.errorParameters
        ?.filter((param) => param.key === "productIds")
        .flatMap((param) => param.value.split(","))
        .forEach((id) => productIds.push(id));
    });
  });

  return [...new Set(productIds)];
}

const isValid = computed(() => duplicateSkuItems.value?.every((item) => !!item.productId));

onMounted(async () => {
  const itemsWithDuplicateProducts = errorItems.value.filter((item) =>
    item.errors?.some((error) => error.errorCode === PRODUCT_DUPLICATE_SKU_ID),
  );

  console.log(errorItems.value);

  await fetchProducts({
    productIds: getDuplicateProductIds(itemsWithDuplicateProducts),
  });

  duplicateSkuItems.value = itemsWithDuplicateProducts.map(
    (item) =>
      ({
        sku: item.productSku,
        quantity: item.quantity,
        products: products.value
          ?.filter((product) => product.code === item.productSku)
          .map((product) => ({
            id: product.id,
            name: product.name,
          })),
      }) as DuplicateSkuProductType,
  );
});
</script>
