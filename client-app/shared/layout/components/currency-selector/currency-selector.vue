<template>
  <VcDropdownMenu
    placement="bottom-end"
    width="8rem"
    class="currency-selector"
    data-test-id="main-layout.top-header.currency-selector"
  >
    <template #trigger="{ opened, triggerProps }">
      <button
        type="button"
        class="currency-selector__button"
        data-test-id="main-layout.top-header.currency-selector-button"
        v-bind="triggerProps"
      >
        <span class="currency-selector__label">
          {{ $t("shared.layout.currency_selector.label") }}
        </span>

        <span class="currency-selector__text" data-test-id="main-layout.top-header.current-currency-label">
          {{ currentCurrency.code }}
        </span>

        <VcIcon class="currency-selector__arrow" size="xxs" :name="opened ? 'chevron-up' : 'chevron-down'" />
      </button>
    </template>

    <template #content="{ close }">
      <VcMenuItem
        v-for="item in supportedCurrencies"
        :key="item.code"
        :active="item.code === currentCurrency.code"
        :data-test-currency-code="item.code"
        data-test-id="main-layout.top-header.currency-selector-item"
        color="secondary"
        truncate
        @click="
          select(item.code);
          close();
        "
      >
        <template #prepend>
          <VcBadge rounded color="secondary">{{ item.symbol }}</VcBadge>
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

<style lang="scss">
.currency-selector {
  @apply flex h-full items-stretch;

  &__button {
    @apply flex h-full items-center gap-3 p-1;

    @media (min-width: theme("screens.lg")) {
      @apply gap-1.5;
    }
  }

  &__label {
    @apply hidden;

    @media (min-width: theme("screens.lg")) {
      @apply block text-sm;
    }
  }

  &__img {
    @apply size-7;

    @media (min-width: theme("screens.lg")) {
      @apply size-3.5;
    }
  }

  &__text {
    @apply hidden;

    @media (min-width: theme("screens.lg")) {
      @apply block uppercase text-[--header-top-link-color] hover:text-[--header-top-link-hover-color];
    }
  }

  &__arrow {
    @apply size-4 fill-[--mobile-menu-navigation-color];

    @media (min-width: theme("screens.lg")) {
      @apply size-2.5 fill-primary;
    }
  }
}
</style>
