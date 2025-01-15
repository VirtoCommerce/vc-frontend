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
      <VcIcon class="vc-back-in-stock-notify-button__link-icon" name="bell" size="xs" color="accent" />
      <span class="vc-back-in-stock-notify-button__link-text">
        {{ isSubscribed ? $t("common.messages.you_will_be_notified") : $t("common.messages.notify_me_when_in_stock") }}
      </span>
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { globals } from "@/core/globals";
import { useBackInStockSubscriptions } from "../composables";
import type { DeactivateBackInStockSubscriptionCommandType } from "../api/graphql/types";
interface IProps {
  productId?: string;
}
const props = withDefaults(defineProps<IProps>(), {
  productId: "",
});
const { storeId } = globals;
const { loading, deactivateSubscription, activateSubscription, backInStockSubscriptions } =
  useBackInStockSubscriptions();
const isSubscribed = computed(() => {
  return backInStockSubscriptions.value.some(
    (item) => item.productId === props.productId && item.storeId === storeId && item.isActive,
  );
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
  } else {
    await activateSubscription(activatePayload);
  }
};
</script>

<style lang="scss">
.vc-back-in-stock-notify-button {
  @apply flex flex-row mb-4.5 h-9;
  &__link {
    @apply flex items-center gap-1 text-sm text-[--link-color] hover:text-[--link-hover-color];
    @media (width > theme("screens.lg")) {
      @apply text-xs;
    }
  }
  &__link-text {
    @apply truncate;
  }
  &__link-icon {
    @apply shrink-0 me-1 text-accent-600;
  }
  .vc-button__slot {
    @apply flex items-center justify-center;
  }
  .vc-button .vc-icon:first-child:not(:last-child) {
    @apply me-1;
  }
}
</style>
