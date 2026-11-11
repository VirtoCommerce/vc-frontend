<template>
  <li class="renewal-item" :class="{ 'renewal-item--excluded': item.isExcluded || !item.isAvailable }">
    <span class="renewal-item__thumb">
      <VcImage :src="item.imageUrl" :alt="item.productName ?? ''" class="renewal-item__image" lazy />
    </span>

    <span class="renewal-item__name">
      {{ item.productName }}
      <span class="renewal-item__quantity">× {{ item.quantity }}</span>

      <span v-if="!item.isAvailable && !item.isExcluded" class="renewal-item__warning">{{ item.message }}</span>

      <span v-if="item.isExcluded" class="renewal-item__warning">{{
        $t("product_subscriptions.renewal.excluded")
      }}</span>
    </span>

    <span v-if="item.total" class="renewal-item__total">{{ formatMoney(item.total, currency) }}</span>
  </li>
</template>

<script setup lang="ts">
import { formatMoney } from "../utils";
import type { RenewalFieldsFragment } from "../api/graphql/types";

type RenewalItemType = NonNullable<RenewalFieldsFragment["items"]>[number];

interface IProps {
  item: RenewalItemType;
  currency?: string | null;
}

defineProps<IProps>();
</script>

<style lang="scss">
.renewal-item {
  @apply flex items-center gap-3 text-sm;

  &--excluded {
    @apply opacity-60;
  }

  &__thumb {
    @apply flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[--vc-radius] border border-neutral-100 bg-additional-50;
  }

  &__image {
    @apply max-h-full max-w-full;
  }

  &__name {
    @apply flex min-w-0 grow flex-col;
  }

  &__quantity {
    @apply text-neutral-600;
  }

  &__warning {
    @apply text-xs text-danger;
  }

  &__total {
    @apply shrink-0 font-bold;
  }
}
</style>
