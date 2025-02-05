<template>
  <VcModal :title="$t('back_in_stock.deactivate_modal.title')" icon="warning" variant="danger">
    <i18n-t keypath="back_in_stock.deactivate_modal.message" scope="global" tag="p">
      <template #productName>
        <span class="font-black">{{ productName }}</span>
      </template>
    </i18n-t>

    <template #actions="{ close }">
      <VcButton :loading="fetching" color="danger" @click="remove(close)">
        {{ $t("back_in_stock.deactivate_modal.delete_button") }}
      </VcButton>

      <VcButton class="ms-auto" color="secondary" variant="outline" @click="close">
        {{ $t("back_in_stock.deactivate_modal.cancel_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script lang="ts" setup>
import { globals } from "@/core/globals";
import { useBackInStockSubscriptions } from "../composables/useBackInStockSubscriptions";
import type { DeactivateBackInStockSubscriptionCommandType } from "../api/graphql/types";

interface IEmits {
  (event: "result"): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const {storeId} = globals;

interface IProps {
  productId: string;
  productName: string;
}

const {fetching, deactivateSubscription} = useBackInStockSubscriptions();

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
