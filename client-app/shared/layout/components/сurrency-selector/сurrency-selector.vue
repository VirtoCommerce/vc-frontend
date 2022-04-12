<template>
  <div v-click-outside="hideList" class="relative select-none">
    <button
      class="relative py-3 pr-3.5 appearance-none leading-none text-[color:var(--color-header-top-link)] hover:text-[color:var(--color-header-top-link-hover)]"
      @click="toggle"
    >
      <span class="text-white mr-1.5">
        {{ $t("shared.layout.currency_selector.label") }}
      </span>

      <span>
        {{ currentCurrency.code }}
      </span>

      <span class="absolute inset-y-0 right-0 flex items-center pointer-events-none">
        <i class="text-[color:var(--color-primary)] fas fa-chevron-down text-[0.625rem]" />
      </span>
    </button>

    <transition name="slide-fade-top">
      <div v-show="open" class="absolute -mt-1 right-0 z-10 bg-white shadow-lg max-h-56 rounded border overflow-hidden">
        <ul ref="listElement" class="max-h-56 overflow-auto divide-y">
          <li
            v-for="item in $context.availCurrencies"
            :key="item.code"
            :class="[item.code === currentCurrency.code ? 'cursor-default' : 'cursor-pointer']"
            class="flex items-center p-2.5 pr-3 font-normal text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
            @click="item.code === currentCurrency.code ? null : select(item.code)"
          >
            <span
              class="flex shrink-0 items-center justify-center w-6 h-6 rounded-[50%] bg-[color:var(--color-primary)] text-white text-base font-bold mr-2"
            >
              {{ item.symbol }}
            </span>

            <span :class="{ 'font-bold text-black': item.code === currentCurrency.code }">
              {{ item.code }}
            </span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { clickOutside } from "@core/directives";

export default {
  directives: {
    clickOutside, // VueUse (v7.5.5) onClickOutside doesn't work in Safari
  },
};
</script>

<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { useCurrency } from "@core/composables";

const { currentCurrency, setCurrencyByCode } = useCurrency();

const open = ref(false);
const listElement = shallowRef<HTMLElement | null>(null);

function hideList() {
  open.value = false;

  setTimeout(() => {
    if (listElement.value) {
      listElement.value.scrollTop = 0;
    }
  }, 350);
}

function toggle() {
  if (open.value) {
    hideList();
  } else {
    open.value = true;
  }
}

function select(code: string) {
  setCurrencyByCode(code);
  hideList();
}
</script>
