<template>
  <VcModal :title="$t('shared.bulk_order.add_to_cart_sku_errors_modal.title')" class="p-6" variant="warn">
    <div class="p-6">
      <div class="mb-4">
        <p>
          {{ $t("shared.bulk_order.add_to_cart_sku_errors_modal.common_message") }}
        </p>

        <p v-if="duplicateSkuItems?.length">
          {{ $t("shared.bulk_order.add_to_cart_sku_errors_modal.duplicate_skus_message") }}
        </p>
      </div>

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
                @change="duplicateSkuItem.errors = undefined"
              />

              <div v-if="duplicateSkuItem.errors?.length" class="text-danger">
                <div v-for="error in duplicateSkuItem.errors" :key="error.objectId">
                  {{ translate(error) }}
                </div>
              </div>
            </td>
            <td class="text-center">
              {{ duplicateSkuItem.quantity }}
            </td>
          </tr>

          <!-- Other SKU errors -->
          <tr v-for="errorItem in otherErrorItems" :key="errorItem.productSku" class="my-4">
            <td>
              {{ errorItem.productSku }}
            </td>
            <td class="text-danger" colspan="2">
              <div v-for="error in errorItem.errors" :key="error.errorCode">
                {{ translate(error) }}
              </div>
              {{ $t(`validation_error.${errorItem.errors?.[0]?.errorCode}`) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template v-if="duplicateSkuItems?.length" #actions>
      <VcButton
        :disabled="!isValid || addingToCart"
        :loading="addingToCart"
        class="mx-auto"
        @click="addDuplicateSkuItemsToCart(duplicateSkuItems)"
      >
        {{ $t("common.buttons.add_items_to_cart") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef } from "vue";
import { useErrorsTranslator } from "@/core/composables";
import { useShortCart } from "@/shared/cart";
import { useProducts } from "@/shared/catalog";
import type { DuplicateSkuProductType } from "../types";
import type { InputNewCartItemType, ValidationErrorType } from "@/core/api/graphql/types";
import type { OutputBulkItemType } from "@/shared/cart";

interface IEmits {
  (event: "confirm"): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  errorItems: OutputBulkItemType[];
}

const { products, fetchProducts } = useProducts();
const { addItemsToCart } = useShortCart();
const { translate } = useErrorsTranslator<ValidationErrorType>("validation_error");

const PRODUCT_DUPLICATE_SKU_ID = "PRODUCT_DUPLICATE_SKU";

const errorItems = toRef(props, "errorItems");

const addingToCart = ref(false);
const duplicateSkuItems = ref<DuplicateSkuProductType[]>();
const otherErrorItems = ref<OutputBulkItemType[]>(
  errorItems.value.filter((item) => item.errors?.some((error) => error.errorCode !== PRODUCT_DUPLICATE_SKU_ID)),
);

const isValid = computed(() => duplicateSkuItems.value?.every((item) => !!item.productId));

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

async function addDuplicateSkuItemsToCart(itemsToAdd: DuplicateSkuProductType[]): Promise<void> {
  addingToCart.value = true;

  const productsToAdd = itemsToAdd.map(
    (item) =>
      ({
        productId: item.productId,
        quantity: item.quantity,
      }) as InputNewCartItemType,
  );

  const result = await addItemsToCart(productsToAdd);

  addingToCart.value = false;

  if (result?.validationErrors?.length) {
    duplicateSkuItems.value?.forEach((item) => {
      item.errors = result.validationErrors.filter((error) => error.objectId === item.productId);
    });

    return;
  }

  emit("confirm");
}

onMounted(async () => {
  const itemsWithDuplicateProducts = errorItems.value.filter((item) =>
    item.errors?.some((error) => error.errorCode === PRODUCT_DUPLICATE_SKU_ID),
  );

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
