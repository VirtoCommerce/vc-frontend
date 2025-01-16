<template>
  <VcProductButton
    color="accent"
    class=" flex-g"
    icon="notification-v2"
    :loading="isProductSubscriptionPending(product.id)"
    :button-text="
      isProductSubscriptionActive(product.id)
        ? $t('back_in_stock.messages.you_will_be_notified')
        : $t('back_in_stock.messages.notify_me_when_in_stock')
    "
    @click="updateBackInStockSubscription"
  >
    <div class="mt-6 flex flex-wrap items-center gap-1">
      <InStock
        :is-in-stock="product.availabilityData?.isInStock"
        :is-digital="isDigital"
        :quantity="product.availabilityData?.availableQuantity"
      />

      <CountInCart :product-id="product.id" />
    </div>
  </VcProductButton>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, toRefs } from "vue";
import { ProductType } from "@/core/enums";
import { globals } from "@/core/globals";
import { CountInCart, InStock } from "@/shared/catalog/components";
import { useBackInStockSubscriptions } from "../composables";
import type { DeactivateBackInStockSubscriptionCommandType } from "../api/graphql/types";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
}
const props = defineProps<IProps>();
const { product } = toRefs(props);
const { storeId } = globals;
const {
  activateSubscription,
  deactivateSubscription,
  isProductSubscriptionActive,
  isProductSubscriptionPending,
  addVisibleProductId,
  removeVisibleProductId,
} = useBackInStockSubscriptions();

const isDigital = computed(() => product.value.productType === ProductType.Digital);

const updateBackInStockSubscription = async () => {
  const activatePayload: DeactivateBackInStockSubscriptionCommandType = {
    productId: product.value.id,
    storeId: storeId,
  };
  const deactivatePayload: DeactivateBackInStockSubscriptionCommandType = {
    productId: product.value.id,
    storeId: storeId,
  };
  if (isProductSubscriptionActive(product.value.id)) {
    await deactivateSubscription(deactivatePayload);
  } else {
    await activateSubscription(activatePayload);
  }
};

onMounted(() => {
  addVisibleProductId(product.value.id);
});

onUnmounted(() => {
  removeVisibleProductId(product.value.id);
});
</script>
