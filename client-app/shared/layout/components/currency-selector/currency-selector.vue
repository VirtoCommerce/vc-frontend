<template>
  <div class="flex items-stretch gap-x-1.5">
    <span class="self-center text-sm">
      {{ $t("shared.layout.currency_selector.label") }}
    </span>

    <VcDropdownMenu placement="bottom-end" width="7.5rem" @toggle="toggle($event)">
      <template #trigger>
        <span
          class="flex items-center gap-x-1.5 text-[--header-top-link-color] hover:text-[--header-top-link-hover-color]"
        >
          <span class="uppercase">
            {{ currentCurrency.code }}
          </span>

          <VcIcon class="text-[--color-primary-500]" size="xxs" :name="open ? 'chevron-up' : 'chevron-down'" />
        </span>
      </template>

      <template #content>
        <VcMenuItem
          v-for="item in supportedCurrencies"
          :key="item.code"
          :active="item.code === currentCurrency.code"
          color="secondary"
          @click="select(item.code)"
        >
          <span
            class="flex size-5 shrink-0 items-center justify-center rounded-full bg-[--color-secondary-600] text-base font-bold text-[--color-additional-50]"
          >
            {{ item.symbol }}
          </span>

          <span>{{ item.code }}</span>
        </VcMenuItem>
      </template>
    </VcDropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCurrency } from "@/core/composables";

const { currentCurrency, supportedCurrencies, saveCurrencyCode } = useCurrency();

const open = ref(false);

function toggle(value: boolean) {
  open.value = value;
}

function select(code: string) {
  if (currentCurrency.value?.code !== code) {
    saveCurrencyCode(code);
  }
}
</script>
