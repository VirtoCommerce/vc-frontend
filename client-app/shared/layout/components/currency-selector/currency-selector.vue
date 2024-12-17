<template>
  <VcDropdownMenu placement="bottom-end" width="7.5rem" class="h-full">
    <template #trigger="{ opened }">
      <button type="button" class="flex h-full items-center gap-x-1.5">
        <span class="text-sm">
          {{ $t("shared.layout.currency_selector.label") }}
        </span>

        <span class="uppercase text-[--header-top-link-color] hover:text-[--header-top-link-hover-color]">
          {{ currentCurrency.code }}
        </span>

        <VcIcon class="fill-primary" size="xxs" :name="opened ? 'chevron-up' : 'chevron-down'" />
      </button>
    </template>

    <template #content="{ close }">
      <VcMenuItem
        v-for="item in supportedCurrencies"
        :key="item.code"
        :active="item.code === currentCurrency.code"
        color="secondary"
        @click="
          select(item.code);
          close();
        "
      >
        <span
          class="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary-600 text-base font-bold text-additional-50"
        >
          {{ item.symbol }}
        </span>

        <span>{{ item.code }}</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
import { useChangeCartCurrencyMutation } from "@/core/api/graphql";
import { useCurrency } from "@/core/composables";
import { globals } from "@/core/globals";
import { useFullCart } from "@/shared/cart";

const { currentCurrency, supportedCurrencies, saveCurrencyCode } = useCurrency();
const { cart } = useFullCart();
const { mutate: changeCartCurrency } = useChangeCartCurrencyMutation();
const { userId } = globals;

async function select(code: string): Promise<void> {
  if (currentCurrency.value?.code !== code) {
    if (cart.value) {
      await changeCartCurrency({
        command: {
          userId,
          cartId: cart.value.id,
          cartName: cart.value.name,
          cartType: cart.value.type,
          newCurrencyCode: code,
        },
      });
    }

    saveCurrencyCode(code);
  }
}
</script>
