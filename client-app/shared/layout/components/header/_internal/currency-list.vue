<template>
  <VcScrollbar ref="list" vertical role="listbox" class="currency-list" test-id="preferences-menu-currencies">
    <VcMenuItem
      v-for="currency in supportedCurrencies"
      :key="currency.code"
      role="option"
      color="secondary"
      class="currency-list__item"
      :active="currency.code === currentCurrency.code"
      :aria-selected="currency.code === currentCurrency.code"
      :data-currency-code="currency.code"
      truncate
      @click="select(currency.code)"
    >
      <span class="currency-list__symbol" aria-hidden="true">{{ currency.symbol }}</span>

      <span class="currency-list__code">{{ currency.code }}</span>

      <span class="currency-list__name">{{ getCurrencyName(currency) }}</span>
    </VcMenuItem>
  </VcScrollbar>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useLanguages } from "@/core/composables/useLanguages";
import { useCurrencySwitch } from "@/shared/layout/composables/useCurrencySwitch";
import { useListboxKeyboard } from "@/shared/layout/composables/useListboxKeyboard";
import type { ICurrency } from "@/core/types";
import type { ComponentPublicInstance } from "vue";

interface IEmits {
  (event: "select"): void;
}

const emit = defineEmits<IEmits>();

const { currentCurrency, supportedCurrencies, selectCurrency } = useCurrencySwitch();
const { currentLanguage } = useLanguages();

const list = useTemplateRef<ComponentPublicInstance>("list");

useListboxKeyboard(() => list.value?.$el as HTMLElement | undefined);

// In the page language, capitalised as a list entry; the platform's English name where the browser lacks the code.
function getCurrencyName(currency: ICurrency): string {
  const locale = currentLanguage.value?.cultureName;
  let name: string | undefined;

  try {
    name = new Intl.DisplayNames(locale, { type: "currency", fallback: "none" }).of(currency.code);
  } catch {
    // A malformed locale or currency code.
  }

  return name ? name.charAt(0).toLocaleUpperCase(locale) + name.slice(1) : currency.englishName;
}

function select(code: string): void {
  void selectCurrency(code);
  emit("select");
}
</script>

<style lang="scss">
.currency-list {
  // The cap of the dropdown the currencies had in the top header.
  @apply max-h-48;

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
