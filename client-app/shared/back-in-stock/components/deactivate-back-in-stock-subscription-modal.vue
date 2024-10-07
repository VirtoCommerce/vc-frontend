<template>
  <VcModal
    :title="$t('shared.back-in-stock.deactivate_back_in_stock_subscription_modal.title')"
    variant="danger"
    icon="warning"
  >
    <i18n-t keypath="shared.back-in-stock.deactivate_back_in_stock_subscription_modal.message" scope="global" tag="p">
      <template #productName>
        <b class="font-black">{{ productName }}</b>
      </template>
    </i18n-t>

    <template #actions="{ close }">
      <VcButton :loading="loading" color="danger" @click="remove(close)">
        {{ $t("shared.back-in-stock.deactivate_back_in_stock_subscription_modal.delete_button") }}
      </VcButton>

      <VcButton color="secondary" variant="outline" class="ms-auto" @click="close">
        {{ $t("shared.back-in-stock.deactivate_back_in_stock_subscription_modal.cancel_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { globals } from "../../../core/globals";
import { useBackInStockSubscriptions } from "../composables/useBackInStockSubscriptions";
import type { DeactivateBackInStockSubscriptionCommandType } from "../../../core/api/graphql/types";

interface IEmits {
  (event: "result"): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const { storeId } = globals;
interface IProps {
  productId: string;
  productName: string;
}

const { loading, deactivateSubscription } = useBackInStockSubscriptions();

async function remove(closingHandle: () => void) {
  const payload: DeactivateBackInStockSubscriptionCommandType = {
    productId: props.productId,
    storeId: storeId,
  };

  await deactivateSubscription(payload);

  emit("result");
  closingHandle();
}
</script>
