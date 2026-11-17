<template>
  <!-- On the order details page of an order a subscription placed itself on its delivery date. -->
  <VcAlert
    v-if="renewal"
    class="order-subscription-notice"
    color="info"
    variant="soft"
    size="sm"
    icon
    data-test-id="order-subscription-notice"
  >
    <p class="order-subscription-notice__text">
      {{ text }}
      <VcLink
        :to="{ name: SUBSCRIPTIONS_ROUTE_NAME }"
        class="order-subscription-notice__link"
        data-test-id="order-subscription-notice-manage-link"
      >
        {{ $t("product_subscriptions.order.manage") }}
      </VcLink>
    </p>
  </VcAlert>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useOrderSubscriptions } from "../composables/useOrderSubscriptions";
import { SUBSCRIPTIONS_ROUTE_NAME } from "../constants";
import type { CustomerOrderType } from "@/core/api/graphql/types";

interface IProps {
  order?: CustomerOrderType;
}

const props = defineProps<IProps>();

const { t, d } = useI18n();
const { ensure, renewalFor, subscriptionsOf } = useOrderSubscriptions();

const renewal = renewalFor(() => props.order?.id);
const subscriptions = subscriptionsOf(() => props.order?.id);
/** One text node before the link, so the space in front of it isn't condensed away. */
const text = computed(() => {
  if (!renewal.value) {
    return "";
  }
  const numbers = subscriptions.value.map((x) => x.number);
  const sentences = [t("product_subscriptions.order.automatic", { date: d(renewal.value.scheduledDate) })];
  if (numbers.length) {
    sentences.push(t("product_subscriptions.order.subscriptions", { numbers: numbers.join(", ") }, numbers.length));
  }
  return sentences.join(" ");
});

onMounted(() => {
  if (props.order) {
    void ensure(props.order.id);
  }
});
</script>

<style lang="scss">
.order-subscription-notice {
  &__link {
    @apply text-[--link-color] hover:text-[--link-hover-color];
  }
}
</style>
