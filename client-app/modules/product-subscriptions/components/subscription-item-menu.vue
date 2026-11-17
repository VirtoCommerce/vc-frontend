<template>
  <VcDropdownMenu v-if="canPause || canCancel" class="subscription-item-menu" placement="bottom-end" width="14rem">
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
      <VcMenuItem
        v-if="canPause"
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
        v-if="canCancel"
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
  (event: "pause", subscriptions: ProductSubscriptionFieldsFragment[]): void;
  (event: "cancel", subscriptions: ProductSubscriptionFieldsFragment[]): void;
}

interface IProps {
  /** The subscriptions of one delivery: the menu acts on all of them at once. */
  subscriptions: ProductSubscriptionFieldsFragment[];
  disabled?: boolean;
  testId?: string;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  testId: "subscription-settings",
});

const pausable = computed(() => props.subscriptions.filter((x) => x.canPause));
const cancellable = computed(() => props.subscriptions.filter((x) => x.canCancel));
const canPause = computed(() => pausable.value.length > 0);
const canCancel = computed(() => cancellable.value.length > 0);
</script>
