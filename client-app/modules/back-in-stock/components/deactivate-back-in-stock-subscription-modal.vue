<template>
  <VcModal :title="$t('back_in_stock.deactivate_modal.title')" variant="danger" icon="warning">
    <i18n-t keypath="back_in_stock.deactivate_modal.message" scope="global" tag="p">
      <template #productName>
        <span class="font-black">{{ productName }}</span>
      </template>
    </i18n-t>

    <template #actions="{ close }">
      <VcButton :loading="fetching" color="danger" @click="remove(close)">
        {{ $t("back_in_stock.deactivate_modal.delete_button") }}
      </VcButton>

      <VcButton color="secondary" variant="outline" class="ms-auto" @click="close">
        {{ $t("back_in_stock.deactivate_modal.cancel_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { globals } from "@/core/globals";
import { useBackInStockSubscriptions } from "../composables/useBackInStockSubscriptions";
import type { DeactivateBackInStockSubscriptionCommandType } from "../api/graphql/types";

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

const { fetching, deactivateSubscription } = useBackInStockSubscriptions();

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
