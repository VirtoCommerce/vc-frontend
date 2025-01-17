<template>
  <VcProductButton
    color="accent"
    class="back-in-stock-notify-button"
    :icon="isProductSubscriptionActive(product.id) ? 'notification' : 'notification-non-active'"
    :loading="isProductSubscriptionPending(product.id)"
    :button-text="
      isProductSubscriptionActive(product.id)
        ? $t('back_in_stock.messages.you_will_be_notified')
        : $t('back_in_stock.messages.notify_me_when_in_stock')
    "
    @link-click="updateBackInStockSubscription"
  >
    <div class="back-in-stock-notify-button__text">
      <VcIcon name="information-circle" size="xs" />
      {{ $t("back_in_stock.messages.click_to_receive_alert") }}
    </div>
  </VcProductButton>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { globals } from "@/core/globals";
import { useNotifications } from "@/shared/notification/composables";
import { useBackInStockSubscriptions } from "../composables";
import type { DeactivateBackInStockSubscriptionCommandType } from "../api/graphql/types";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
}
const props = defineProps<IProps>();
const { product } = toRefs(props);
const { storeId } = globals;

const { success } = useNotifications();
const { t } = useI18n();
const {
  activateSubscription,
  deactivateSubscription,
  isProductSubscriptionActive,
  isProductSubscriptionPending,
  addVisibleProductId,
  removeVisibleProductId,
} = useBackInStockSubscriptions();

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
    success({
      text: t("back_in_stock.messages.you_are_subscribed"),
      group: "back-in-stock",
      singleInGroup: true,
      duration: DEFAULT_NOTIFICATION_DURATION,
      button: {
        text: t("back_in_stock.navigation.route_name"),
        to: {
          name: "BackInStockSubscriptions",
        },
      },
    });
  }
};

onMounted(() => {
  addVisibleProductId(product.value.id);
});

onUnmounted(() => {
  removeVisibleProductId(product.value.id);
});
</script>

<style lang="scss">
.back-in-stock-notify-button {
  --vc-icon-size: 1.5rem;
  --vc-icon-color: var(--link-color, theme("colors.accent.600"));

  &__text {
    @apply flex items-center text-xs font-bold gap-1 w-full justify-start h-5 mt-4.5 text-[--link-color];
  }
}
</style>
