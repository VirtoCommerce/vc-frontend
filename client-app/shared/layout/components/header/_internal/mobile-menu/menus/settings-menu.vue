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

interface IEmits {
  (event: "close"): void;
}

const emit = defineEmits<IEmits>();

const { currentCurrency, supportedCurrencies, saveCurrencyCode } = useCurrency();
const { mutate: changeCartCurrency } = useChangeCartCurrencyMutation();
const { userId } = globals;

async function changeCurrency(code: string): Promise<void> {
  if (currentCurrency.value?.code !== code) {
    emit("close");

    await changeCartCurrency({
      command: {
        userId,
        newCurrencyCode: code,
      },
    });

    saveCurrencyCode(code);
  }
}
</script>
