<template>
  <VcMenuList role="listbox" class="currency-list" data-test-id="preferences-menu-currencies">
    <VcScrollbar vertical class="currency-list__scroll">
      <VcMenuItem
        v-for="currency in supportedCurrencies"
        :key="currency.code"
        color="secondary"
        class="currency-list__item"
        :active="isCurrent(currency)"
        :data-currency-code="currency.code"
        truncate
        @click="select(currency.code)"
      >
        <span class="currency-list__symbol" aria-hidden="true">{{ currency.symbol }}</span>

        <span class="currency-list__code">{{ currency.code }}</span>

        <span class="currency-list__name">{{ getCurrencyName(currency) }}</span>
      </VcMenuItem>
    </VcScrollbar>
  </VcMenuList>
</template>

<script setup lang="ts">
import { upperFirst } from "lodash-es";
import { useLanguages } from "@/core/composables/useLanguages";
import { useCurrencySwitch } from "@/shared/layout/composables/useCurrencySwitch";
import type { ICurrency } from "@/core/types";

interface IEmits {
  (event: "select"): void;
}

const emit = defineEmits<IEmits>();

const { currentCurrency, supportedCurrencies, selectCurrency } = useCurrencySwitch();
const { currentLanguage } = useLanguages();

function isCurrent(currency: ICurrency): boolean {
  return currency.code === currentCurrency.value.code;
}

function getDisplayName(locale: string | undefined, code: string): string | undefined {
  try {
    return new Intl.DisplayNames(locale, { type: "currency", fallback: "none" }).of(code);
  } catch {
    // A malformed locale or currency code.
    return undefined;
  }
}

// In the page language, capitalised as a list entry; the platform's English name where the browser lacks the code.
function getCurrencyName(currency: ICurrency): string {
  const name = getDisplayName(currentLanguage.value?.cultureName, currency.code);

  if (!name) {
    return currency.englishName;
  }

  return upperFirst(name);
}

function select(code: string): void {
  void selectCurrency(code);
  emit("select");
}
</script>

<style lang="scss">
.currency-list {
  // The rows scroll within whatever height the list is given.
  @apply flex flex-col;

  &__symbol {
    @apply w-8 flex-none text-center text-neutral-600;
  }

  &__code {
    @apply flex-none font-bold;
  }

  &__name {
    @apply ms-auto ps-6 text-neutral-600;
  }
}
</style>
