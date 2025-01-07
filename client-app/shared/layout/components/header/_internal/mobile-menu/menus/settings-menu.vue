<template>
  <div class="mt-4 flex grow flex-col gap-y-1 font-normal">
    <header class="-mt-1 mb-1 text-2xl uppercase text-additional-50">
      {{ $t("shared.layout.header.mobile.currency") }}
    </header>

    <VcRadioButton
      v-for="currencyItem in supportedCurrencies"
      :key="currencyItem.code"
      v-model="currentCurrency.code"
      :value="currencyItem.code"
      class="py-2.5"
      @click="changeCurrency(currencyItem.code)"
    >
      <span :class="{ 'text-additional-50': currentCurrency?.code === currencyItem.code }" class="uppercase">
        {{ currencyItem.code }}
      </span>
    </VcRadioButton>
  </div>
</template>

<script setup lang="ts">
import { useChangeCartCurrencyMutation } from "@/core/api/graphql";
import { useCurrency } from "@/core/composables";
import { globals } from "@/core/globals";
import { useFullCart } from "@/shared/cart";

const { currentCurrency, supportedCurrencies, saveCurrencyCode } = useCurrency();
const { mutate: changeCartCurrency } = useChangeCartCurrencyMutation();
const { cart } = useFullCart();
const { userId } = globals;

function changeCurrency(code: string): void {
  if (currentCurrency.value?.code === code) {
    return;
  }

  saveCurrencyCode(code);

  if (cart.value?.id) {
    void changeCartCurrency({
      command: {
        userId,
        cartId: cart.value.id,
        newCurrencyCode: code,
      },
    });
  }
}
</script>
