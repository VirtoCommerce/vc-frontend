<template>
  <div v-on-click-outside="() => open && hideList()" class="relative select-none text-[13px]">
    <button
      type="button"
      class="relative flex appearance-none items-center gap-x-1.5 py-3 leading-none text-[color:var(--color-header-top-link)] hover:text-[color:var(--color-header-top-link-hover)]"
      @click="toggle"
    >
      <span class="text-white">
        {{ $t("shared.layout.currency_selector.label") }}
      </span>

      <span class="uppercase">
        {{ currentCurrency?.code }}
      </span>

      <i
        class="fas text-[1rem] text-[color:var(--color-mobile-menu-link)] lg:text-[0.625rem] lg:text-[color:var(--color-primary)]"
        :class="[open ? 'fa-chevron-up' : 'fa-chevron-down']"
      />
    </button>

    <transition name="slide-fade-top">
      <div v-show="open" class="absolute right-0 z-30 max-h-56 overflow-hidden rounded border bg-white shadow-lg">
        <ul ref="listElement" class="max-h-56 divide-y overflow-auto">
          <li
            v-for="item in supportedCurrencies"
            :key="item.code"
            :class="[
              item.code === currentCurrency?.code
                ? 'cursor-default bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]'
                : 'cursor-pointer',
            ]"
            class="flex items-center p-2.5 pr-3 font-normal text-black hover:bg-gray-100"
            @click="item.code === currentCurrency?.code ? null : select(item.code)"
          >
            <span
              class="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-[50%] bg-[color:var(--color-primary)] text-base font-bold text-white"
            >
              {{ item.symbol }}
            </span>

            <span :class="{ 'font-bold text-black': item.code === currentCurrency?.code }">
              {{ item.code }}
            </span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { useCurrency } from "@/core/composables";

const { currentCurrency, supportedCurrencies, saveCurrencyCodeAndReload } = useCurrency();

const open = ref(false);
const listElement = shallowRef<HTMLElement | null>(null);

function hideList() {
  const HIDE_TIMEOUT = 350;
  open.value = false;

  setTimeout(() => {
    if (listElement.value) {
      listElement.value.scrollTop = 0;
    }
  }, HIDE_TIMEOUT);
}

function toggle() {
  if (open.value) {
    hideList();
  } else {
    open.value = true;
  }
}

function select(code: string) {
  saveCurrencyCodeAndReload(code);
  hideList();
}
</script>
