<template>
  <VcWidget
    id="list-summary"
    class="max-md:mt-5 print:break-inside-avoid"
    :title="$t('common.titles.order_summary')"
  >
    <div class="relative">
      <div class="flex justify-between text-base font-black">
        <span>{{ $t("common.labels.subtotal") }}</span>
        <span>
          <VcPriceDisplay :value="list.subTotal!" />
        </span>
      </div>
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
