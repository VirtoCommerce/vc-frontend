<template>
  <div class="subscription-frequency-picker" :class="{ 'subscription-frequency-picker--disabled': disabled }">
    <VcLabel size="xs">
      {{ $t("product_subscriptions.purchase_options.deliver_every") }}
    </VcLabel>

    <VcVariantPickerGroup
      :model-value="model"
      type="text"
      size="sm"
      :columns="2"
      :name="name"
      :aria-label="$t('product_subscriptions.purchase_options.deliver_every')"
      :test-id="testId"
      @update:model-value="select"
    >
      <VcVariantPicker
        v-for="option in options"
        :key="option.key"
        type="text"
        size="sm"
        :value="option.key"
        :label="option.label"
        is-available
        :test-id="`${testId}-${option.key}`"
      />
    </VcVariantPickerGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { intervalKey, intervalShortLabel } from "../utils";
import type { SubscriptionIntervalUnit } from "../api/graphql/types";

interface IProps {
  intervals: { unit: SubscriptionIntervalUnit; count: number }[];
  name: string;
  disabled?: boolean;
  testId?: string;
}

const props = defineProps<IProps>();
/** The selected interval key (`MONTH:1`). */
const model = defineModel<string>();

const { t } = useI18n();

const options = computed(() =>
  props.intervals.map((x) => ({ key: intervalKey(x.unit, x.count), label: intervalShortLabel(t, x.unit, x.count) })),
);
function select(key: string | string[] | undefined): void {
  if (typeof key === "string" && !props.disabled) {
    model.value = key;
  }
}
</script>

<style lang="scss">
.subscription-frequency-picker {
  @apply flex flex-col gap-2;

  // The picker has no disabled state; while a change is saved the whole choice is locked.
  &--disabled {
    @apply pointer-events-none opacity-60;
  }
}
</style>
