<template>
  <div>
    <div class="grid grid-cols-5 font-bold">
      <div>{{ $t("pages.account.quote_details.line_items.product") }}</div>
      <div>{{ $t("pages.account.quote_details.line_items.properties") }}</div>
      <div>{{ $t("pages.account.quote_details.line_items.price_per_item") }}</div>
      <div>{{ $t("pages.account.quote_details.line_items.quantity") }}</div>
      <div>{{ $t("pages.account.quote_details.line_items.total") }}</div>
    </div>
    <VcLineItem v-for="item in items" :key="item.id" :item="item" @remove="removeItem">
      <template #pricePerItem>
        <VcPriceDisplay :value="item.selectedTierPrice!.price" />
      </template>

      <template #quantity>
        <input v-model="item.selectedTierPrice!.quantity" />
      </template>

      <template #total>
        <div>{{ $n(item.selectedTierPrice!.price!.amount * item.selectedTierPrice!.quantity, "currency") }}</div>
      </template>
    </VcLineItem>
    <div class="font-bold">
      <div>{{ $t("pages.account.quote_details.line_items.subtotal") }}:</div>
      <div>{{ $n(subtotal, "currency") }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { sumBy } from "lodash";
import { QuoteItemType } from "@/xapi";
import { VcPriceDisplay } from "@/ui-kit/components";

const props = defineProps({
  items: {
    type: Array as PropType<QuoteItemType[]>,
    required: true,
  },
});

const emit = defineEmits(["removeItem"]);

const subtotal = computed<number>(() =>
  sumBy(props.items, (item: QuoteItemType) => item.selectedTierPrice!.price!.amount * item.selectedTierPrice!.quantity)
);

function removeItem(item: QuoteItemType): void {
  emit("removeItem", item);
}
</script>
