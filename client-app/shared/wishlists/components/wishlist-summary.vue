<template>
  <VcWidget id="list-summary" class="list-summary" :title="$t('common.titles.order_summary')">
    <div class="list-summary__content">
      <span>
        {{ $t("common.labels.subtotal") }}
      </span>

      <span v-if="list.subTotal">
        <VcPriceDisplay :value="list.subTotal" />
      </span>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import type { WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list: WishlistType;
}

defineProps<IProps>();
</script>

<style lang="scss">
.list-summary {
  @apply max-md:mt-5 print:break-inside-avoid;

  &__container {
    @apply relative;
  }

  &__content {
    @apply flex justify-between text-base font-black;
  }
}
</style>
