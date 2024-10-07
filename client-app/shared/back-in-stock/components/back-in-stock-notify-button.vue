<template>
  <div class="vc-back-in-stock-notify-button">
    <VcButton
      class="vc-back-in-stock-notify-button__button"
      color="accent"
      variant="outline"
      size="sm"
      full-width
      :loading="loaded"
      @click="updateBackInStockSubscription"
    >
      {{ isSubscribed ? $t("common.messages.you_will_be_notified") : $t("common.messages.notify_me_when_in_stock") }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { globals } from "../../../core/globals";
import { useBackInStockSubscriptions } from "../composables";
import type { DeactivateBackInStockSubscriptionCommandType } from "../../../core/api/graphql/types";

interface IProps {
  productId?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  productId: "",
});
const { storeId } = globals;
const { loading, deactivateSubscription, activateSubscription, backInStockSubscriptions, fetchSubscriptions } =
  useBackInStockSubscriptions();
const isSubscribed = computed(() => {
  return backInStockSubscriptions.value.some((item) => item.productId === props.productId && item.storeId === storeId);
});
const loaded = computed(() => {
  return loading.value;
});
const updateBackInStockSubscription = async () => {
  const activatePayload: DeactivateBackInStockSubscriptionCommandType = {
    productId: props.productId,
    storeId: storeId,
  };

  const deactivatePayload: DeactivateBackInStockSubscriptionCommandType = {
    productId: props.productId,
    storeId: storeId,
  };

  if (isSubscribed.value) {
    await deactivateSubscription(deactivatePayload);
    await fetchSubscriptions();
  } else {
    await activateSubscription(activatePayload);
    await fetchSubscriptions();
  }
};
</script>

<style lang="scss">
.vc-back-in-stock-notify-button {
  @apply flex flex-col;

  &__link {
    @apply flex items-center gap-1 text-sm text-[--link-color] hover:text-[--link-hover-color] mt-2.5;

    @media (width > theme("screens.lg")) {
      @apply text-xs mt-[1.35rem];
    }
  }

  &__link-text {
    @apply truncate;
  }

  &__link-icon {
    @apply shrink-0 text-primary;
  }
}
</style>
