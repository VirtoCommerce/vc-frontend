<template>
  <VcDropdownMenu placement="bottom-end" width="8rem" class="h-full" close-on-blur>
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
        truncate
        @click="
          select(item.code);
          close();
        "
      >
        <template #prepend>
          <VcBadge rounded color="secondary" size="lg">{{ item.symbol }}</VcBadge>
        </template>

        <span>{{ item.code }}</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
import { useMutation } from "@vue/apollo-composable";
import { ChangeCartCurrencyDocument } from "@/core/api/graphql/types";
import { useCurrency } from "@/core/composables";
import { globals } from "@/core/globals";
import { dataChangedEvent, useBroadcast } from "@/shared/broadcast";
import { useShortCart } from "@/shared/cart";

const { currentCurrency, supportedCurrencies, saveCurrencyCode } = useCurrency();
const { cart } = useShortCart();
const { mutate: changeCartCurrency } = useMutation(ChangeCartCurrencyDocument);
const broadcast = useBroadcast();
const { userId, storeId, cultureName, currencyCode: currentCurrencyCode } = globals;

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
          storeId,
          cultureName,
          currencyCode: currentCurrencyCode,
        },
      });
    }

    void broadcast.emit(dataChangedEvent);

    saveCurrencyCode(code);
  }
}
</script>
