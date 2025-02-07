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
import { useMutation } from "@vue/apollo-composable";
import { ChangeCartCurrencyDocument } from "@/core/api/graphql/types";
import { useCurrency } from "@/core/composables";
import { globals } from "@/core/globals";

const { currentCurrency, supportedCurrencies, savedCurrencyCode } = useCurrency();
const { mutate: changeCartCurrency } = useMutation(ChangeCartCurrencyDocument);
const { userId, storeId, cultureName, currencyCode: currentCurrencyCode } = globals;

async function changeCurrency(code: string): Promise<void> {
  if (currentCurrency.value?.code === code) {
    return;
  }

  savedCurrencyCode.value = code;

  await changeCartCurrency({
    command: {
      userId,
      newCurrencyCode: code,
      storeId,
      cultureName,
      currencyCode: currentCurrencyCode,
    },
  });

  location.reload();
}
</script>
