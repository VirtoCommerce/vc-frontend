<template>
  <VcButton
    v-if="isShown"
    class="cart-line-subscribe-button"
    color="secondary"
    size="xs"
    icon-size="1.25rem"
    :icon="icons ? 'refresh-cw' : undefined"
    :prepend-icon="icons ? undefined : 'refresh-cw'"
    variant="soft"
    :disabled="disabled"
    :title="icons ? $t('product_subscriptions.cart.subscribe_button') : undefined"
    :data-test-id="testId"
    @click="openPurchaseOptions()"
  >
    <template v-if="!icons">{{ $t("product_subscriptions.cart.subscribe_button") }}</template>
  </VcButton>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useUser } from "@/shared/account/composables/useUser";
import { useCartLineSubscription } from "../composables/useCartLineSubscription";
import type { PreparedLineItemType } from "@/core/types";

interface IProps {
  lineItem: PreparedLineItemType;
  readonly?: boolean;
  disabled?: boolean;
  /** Icon only, as "Save for later" shows next to it in narrow lines. */
  icons?: boolean;
}

const props = defineProps<IProps>();

const { isAuthenticated } = useUser();
const { offer, subscription, openPurchaseOptions } = useCartLineSubscription(toRef(props, "lineItem"));

// A subscribed line changes its choice from the summary under the line.
const isShown = computed(() => !props.readonly && isAuthenticated.value && !!offer.value && !subscription.value);
// The line renders its actions twice (as icons by the image and in full by the title) and shows one by width.
const testId = computed(() => `cart-line-subscribe-${props.icons ? "icon-" : ""}button-${props.lineItem.id}`);
</script>
