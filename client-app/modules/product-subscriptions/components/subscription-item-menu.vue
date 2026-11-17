<template>
  <VcDropdownMenu v-if="hasItems" class="subscription-item-menu" placement="bottom-end" width="14rem">
    <template #trigger="{ triggerProps }">
      <!-- The same settings button as the company members' actions menu. -->
      <VcButton
        icon
        color="secondary"
        variant="outline"
        size="xs"
        :disabled="disabled"
        :aria-label="$t('product_subscriptions.deliveries.settings')"
        :title="$t('product_subscriptions.deliveries.settings')"
        :data-test-id="`${testId}-button`"
        v-bind="triggerProps"
      >
        <VcIcon name="cog" variant="solid" />
      </VcButton>
    </template>

    <template #content="{ close }">
      <!-- What the store lets customers do comes from the server's can* fields (the store's "Customer actions"). -->
      <VcMenuItem
        v-if="canSkip"
        color="secondary"
        nowrap
        :data-test-id="`${testId}-skip`"
        @click="
          close();
          $emit('skip');
        "
      >
        <template #prepend>
          <VcIcon name="fast-forward" />
        </template>

        {{ $t("product_subscriptions.deliveries.skip") }}
      </VcMenuItem>

      <VcMenuItem
        v-if="orderable.length"
        color="secondary"
        nowrap
        :data-test-id="`${testId}-order-now`"
        @click="
          close();
          $emit('orderNow', orderable);
        "
      >
        <template #prepend>
          <VcIcon name="bolt" />
        </template>

        {{ $t("product_subscriptions.deliveries.order_now") }}
      </VcMenuItem>

      <VcMenuItem
        v-if="cardChangeable.length"
        color="secondary"
        nowrap
        :data-test-id="`${testId}-change-card`"
        @click="
          close();
          $emit('changeCard', cardChangeable);
        "
      >
        <template #prepend>
          <VcIcon name="credit-card" />
        </template>

        {{ $t("product_subscriptions.deliveries.change_card") }}
      </VcMenuItem>

      <VcMenuItem
        v-if="pausable.length"
        color="secondary"
        nowrap
        :data-test-id="`${testId}-pause`"
        @click="
          close();
          $emit('pause', pausable);
        "
      >
        <template #prepend>
          <VcIcon name="pause" />
        </template>

        {{ $t("product_subscriptions.deliveries.pause") }}
      </VcMenuItem>

      <VcMenuItem
        v-if="cancellable.length"
        color="danger"
        nowrap
        :data-test-id="`${testId}-cancel`"
        @click="
          close();
          $emit('cancel', cancellable);
        "
      >
        <template #prepend>
          <VcIcon name="circle-x" />
        </template>

        {{ $t("product_subscriptions.deliveries.cancel") }}
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ProductSubscriptionFieldsFragment } from "../api/graphql/types";

interface IEmits {
  (event: "skip"): void;
  (event: "orderNow", subscriptions: ProductSubscriptionFieldsFragment[]): void;
  (event: "changeCard", subscriptions: ProductSubscriptionFieldsFragment[]): void;
  (event: "pause", subscriptions: ProductSubscriptionFieldsFragment[]): void;
  (event: "cancel", subscriptions: ProductSubscriptionFieldsFragment[]): void;
}

interface IProps {
  /** The subscriptions of one delivery: the menu acts on all of them at once. */
  subscriptions: ProductSubscriptionFieldsFragment[];
  /** Whether this delivery can be skipped (the renewal's own flag). */
  canSkip?: boolean;
  /** Whether this delivery is still open, so its products can be ordered right away instead. */
  canOrderNow?: boolean;
  disabled?: boolean;
  testId?: string;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  testId: "subscription-settings",
});

const orderable = computed(() => (props.canOrderNow ? props.subscriptions.filter((x) => x.canOrderNow) : []));
const cardChangeable = computed(() => props.subscriptions.filter((x) => x.canChangePaymentMethod));
const pausable = computed(() => props.subscriptions.filter((x) => x.canPause));
const cancellable = computed(() => props.subscriptions.filter((x) => x.canCancel));
const hasItems = computed(
  () =>
    props.canSkip ||
    orderable.value.length > 0 ||
    cardChangeable.value.length > 0 ||
    pausable.value.length > 0 ||
    cancellable.value.length > 0,
);
</script>
