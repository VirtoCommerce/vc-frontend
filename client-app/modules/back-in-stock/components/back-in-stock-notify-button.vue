<template>
  <VcProductButton
    color="accent"
    class="back-in-stock-notify-button"
    :icon="isProductSubscriptionActive(product.id) ? 'notification' : 'notification-non-active'"
    :loading="isProductSubscriptionPending(product.id)"
    no-wrap
    truncate
    :title="
      isProductSubscriptionActive(product.id)
        ? $t('back_in_stock.messages.you_will_be_notified')
        : $t('back_in_stock.messages.notify_me_when_in_stock')
    "
    :button-text="
      isProductSubscriptionActive(product.id)
        ? $t('back_in_stock.messages.you_will_be_notified')
        : $t('back_in_stock.messages.notify_me_when_in_stock')
    "
    @link-click="updateBackInStockSubscription"
  >
    <div v-if="isTextShown" class="back-in-stock-notify-button__text">
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
import { dataChangedEvent, useBroadcast } from "@/shared/broadcast";
import { useNotifications } from "@/shared/notification/composables";
import { useBackInStockSubscriptions } from "../composables";
import type {
  ActivateBackInStockSubscriptionCommandType,
  DeactivateBackInStockSubscriptionCommandType,
} from "../api/graphql/types";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
  isTextShown?: boolean;
  lazy?: boolean;
}
const props = defineProps<IProps>();
const { product } = toRefs(props);
const { storeId } = globals;

const broadcast = useBroadcast();
const { success } = useNotifications();
const { t } = useI18n();
const {
  activateSubscription,
  deactivateSubscription,
  isProductSubscriptionActive,
  isProductSubscriptionPending,
  addShownProductId,
  removeShownProductId,
} = useBackInStockSubscriptions();

const updateBackInStockSubscription = async () => {
  const payload: ActivateBackInStockSubscriptionCommandType | DeactivateBackInStockSubscriptionCommandType = {
    productId: product.value.id,
    storeId: storeId,
  };
  if (isProductSubscriptionActive(product.value.id)) {
    await deactivateSubscription(payload);
  } else {
    await activateSubscription(payload);
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
  void broadcast.emit(dataChangedEvent);
};

onMounted(() => {
  if (!props.lazy) {
    addShownProductId(product.value.id);
  }
});

onUnmounted(() => {
  if (!props.lazy) {
    removeShownProductId(product.value.id);
  }
});
</script>

<style lang="scss">
.back-in-stock-notify-button {
  &__text {
    @apply flex items-center text-xs font-bold gap-1 w-full justify-start h-5 mt-4.5 text-[--link-color] truncate;
  }
}
</style>
