<template>
  <header ref="headerElement" class="fixed z-40 w-full shadow-md bg-[color:var(--color-header-bottom-bg)]">
    <!-- region Default slot -->
    <transition :name="isAnimated ? 'slide-fade-top' : ''" mode="out-in">
      <div v-if="customSlots.default">
        <component :is="customSlots.default" />
      </div>

      <div v-else class="relative w-full z-10 h-14 flex justify-between items-center gap-x-6">
        <!-- region Left slot -->
        <component v-if="customSlots.left" :is="customSlots.left" />

        <div v-else class="flex items-center h-full">
          <button class="h-full px-6" @click="mobileMenuVisible = true">
            <i class="fas fa-bars text-2xl text-[color:var(--color-primary)]" />
          </button>

          <router-link to="/">
            <VcImage :src="$cfg.logo_image" :alt="$context.storeName" class="h-8" lazy />
          </router-link>
        </div>
        <!-- endregion Left slot -->

        <!-- region Right slot -->
        <component v-if="customSlots.right" :is="customSlots.right" />

        <div v-else class="flex flex-row items-center h-full pr-4">
          <a class="p-2.5" :href="`tel:${$cfg.support_phone_number}`" v-if="$cfg.support_phone_number">
            <i class="fas fa-phone text-xl text-[color:var(--color-primary)]"></i>
          </a>

          <button class="p-2.5" @click="toggleSearchBar">
            <i class="fas fa-search text-2xl text-[color:var(--color-primary)]" />
          </button>

          <router-link :to="{ name: 'Cart' }" class="p-2.5">
            <span class="relative">
              <i class="fas fa-shopping-cart text-xl text-[color:var(--color-primary)]" />

              <VcTransitionScale mode="out-in">
                <span
                  v-if="cart?.itemsQuantity"
                  class="absolute -top-2.5 -right-3 transition-transform bg-white rounded-full border border-[color:var(--color-primary)] px-1.5 py-0.5 font-extrabold text-11 leading-3 text-[color:var(--color-header-bottom-link)]"
                >
                  {{ preparedCartItemsQuantity }}
                </span>
              </VcTransitionScale>
            </span>
          </router-link>
        </div>
        <!-- endregion Right slot -->
      </div>
    </transition>
    <!-- endregion Default slot -->

    <!-- region Mobile Search Bar -->
    <div v-show="searchBarVisible" class="flex p-4 bg-[color:var(--color-search-bar-bg)] select-none">
      <VcInput
        v-model="searchPhrase"
        maxlength="64"
        :placeholder="$t('shared.layout.header.mobile.search_bar.input_placeholder')"
        class="flex-grow mr-4 h-10"
        input-class="!h-10 !px-4 font-medium text-sm"
        :without-border="true"
        @keyup.enter="$router.push(searchPageLink)"
      />

      <VcButton class="w-10 !h-10" :to="searchPhrase ? searchPageLink : null">
        <i class="fas fa-search text-lg" />
      </VcButton>

      <button @click="hideSearchBar" class="h-10 px-2.5 ml-2 -mr-2 appearance-none">
        <i class="fas fa-times text-2xl text-white" />
      </button>
    </div>
    <!-- endregion Mobile Search Bar -->
  </header>

  <!-- Height placeholder for mobile header due to fixed position -->
  <div :style="placeholderStyle" class="h-14"></div>

  <!-- Mobile menu -->
  <transition
    enter-from-class="-translate-x-full"
    leave-to-class="-translate-x-full"
    enter-active-class="will-change-transform"
    leave-active-class="will-change-transform"
  >
    <MobileMenu v-if="mobileMenuVisible" @close="mobileMenuVisible = false" class="transition-transform" />
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, StyleValue, watchEffect, watch } from "vue";
import { RouteLocationRaw } from "vue-router";
import { useNestedMobileHeader, useSearchBar } from "@/shared/layout";
import MobileMenu from "./mobile-menu.vue";
import { useDomUtils, useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/constants";
import { useElementSize, whenever } from "@vueuse/core";
import { useCart } from "@/shared/cart";
import { numberToShortString } from "@/core/utilities";

const searchPhrase = ref("");
const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
const mobileMenuVisible = ref(false);
const headerElement = ref(null);

const { customSlots, isAnimated } = useNestedMobileHeader();
const { searchBarVisible, toggleSearchBar, hideSearchBar } = useSearchBar();
const { toggleBodyScrollable } = useDomUtils();
const { height } = useElementSize(headerElement);
const { cart } = useCart();

const placeholderStyle = computed<StyleValue | undefined>(() =>
  height.value ? { height: height.value + "px" } : undefined
);

const preparedCartItemsQuantity = computed<string>(() => numberToShortString(cart.value?.itemsQuantity ?? 0));

const searchPageLink = computed<RouteLocationRaw>(() => ({
  name: "Search",
  query: {
    [QueryParamName.SearchPhrase]: searchPhrase.value,
  },
}));

watch(mobileMenuVisible, (value) => {
  toggleBodyScrollable(!value);
});
watchEffect(() => (searchPhrase.value = searchPhraseInUrl.value ?? ""));
whenever(searchBarVisible, () => (searchPhrase.value = searchPhraseInUrl.value ?? ""), { immediate: true });
</script>
