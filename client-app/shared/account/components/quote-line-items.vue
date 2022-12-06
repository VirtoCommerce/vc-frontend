<template>
  <div class="vc-quote-line-items px-6 md:px-7 md:pb-7">
    <div class="hidden md:block">
      <div class="vc-quote-line-items__grid grid gap-x-3 px-4 py-3 border rounded-t text-sm font-bold">
        <div class="vc-quote-line-items__name">
          {{ $t("pages.account.quote_details.line_items.product") }}
        </div>
        <div class="vc-quote-line-items__properties">
          {{ $t("pages.account.quote_details.line_items.properties") }}
        </div>
        <div class="vc-quote-line-items__price hidden xl:block pr-4 text-right">
          {{ $t("pages.account.quote_details.line_items.price_per_item") }}
        </div>
        <div class="vc-quote-line-items__quantity text-right">
          {{ $t("pages.account.quote_details.line_items.quantity") }}
        </div>
        <div class="vc-quote-line-items__total text-right">
          {{ $t("pages.account.quote_details.line_items.total") }}
        </div>
        <div class="vc-quote-line-items__remove-button"></div>
      </div>
    </div>

    <div class="flex flex-col gap-6 md:gap-0 md:border-x md:divide-y">
      <VcLineItem v-for="item in items" :key="item.id" :item="item" @remove="removeItem">
        <template #pricePerItem>
          <VcPriceDisplay class="text-13 font-semibold xl:font-medium" :value="item.selectedTierPrice!.price" />
          <div class="text-11 leading-3 line-through text-[color:var(--color-price-old)]">OLD PRICE</div>
        </template>

        <template #quantity>
          <input
            class="w-20 h-8 border rounded text-center text-sm disabled:bg-[color:var(--color-line-item-light)]/75 md:w-full disabled:text-[color:var(--color-line-item-table-border)]"
            v-model="item.selectedTierPrice!.quantity"
            disabled
          />
        </template>

        <template #total>
          <div class="flex items-center gap-1">
            <div class="text-14 font-bold text-[color:var(--color-price-from)]">
              {{ $t("pages.account.quote_details.line_items.total") }}:
            </div>
            <div class="text-15 font-bold">
              {{ $n(item.selectedTierPrice!.price!.amount * item.selectedTierPrice!.quantity, "currency") }}
            </div>
          </div>
          <div class="text-11 leading-3 line-through text-[color:var(--color-price-old)]">OLD PRICE</div>
        </template>
      </VcLineItem>
    </div>
    <div
      class="flex items-center justify-end py-2.5 gap-2 text-[color:var(--color-price)] md:px-4 md:py-2.5 md:border md:rounded-b"
    >
      <div class="text-13 font-bold">{{ $t("pages.account.quote_details.line_items.subtotal") }}:</div>
      <div class="text-17 font-extrabold">{{ $n(subtotal, "currency") }}</div>
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

<style scoped lang="scss">
.vc-quote-line-items {
  &__grid {
    @media (min-width: theme("screens.md")) {
      grid-template-columns: 200px 1fr 88px 100px 40px;
      grid-template-areas: "name properties quantity total remove-button";
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-columns: 254px 1fr 150px 88px 100px 40px;
      grid-template-areas: "name properties price quantity total remove-button";
    }
  }

  &__name {
    grid-area: name;
  }

  &__properties {
    grid-area: properties;
  }

  &__price {
    grid-area: price;
  }

  &__quantity {
    grid-area: quantity;
  }

  &__total {
    grid-area: total;
  }

  &__remove-button {
    grid-area: remove-button;
  }
}
</style>
