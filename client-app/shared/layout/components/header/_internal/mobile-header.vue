<template>
  <div ref="headerElement" class="fixed z-40 w-full bg-[color:var(--color-header-bottom-bg)] shadow-md">
    <!-- region Default slot -->
    <transition :name="isAnimated ? 'slide-fade-top' : ''" mode="out-in">
      <div v-if="customSlots.default">
        <component :is="customSlots.default" />
      </div>

      <div v-else class="relative z-10 flex h-14 w-full items-center justify-between gap-x-6">
        <!-- region Left slot -->
        <component :is="customSlots.left" v-if="customSlots.left" />

        <div v-else class="flex h-full items-center">
          <button class="h-full px-6" @click="mobileMenuVisible = true">
            <i class="fas fa-bars text-2xl text-[color:var(--color-primary)]" />
          </button>

          <router-link to="/">
            <VcImage :src="$cfg.logo_image" :alt="$context.storeName" class="h-8" lazy />
          </router-link>
        </div>
        <!-- endregion Left slot -->

        <!-- region Right slot -->
        <component :is="customSlots.right" v-if="customSlots.right" />

        <div v-else class="flex h-full flex-row items-center pr-4">
          <a v-if="$cfg.support_phone_number" class="p-2.5" :href="`tel:${$cfg.support_phone_number}`">
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
                  class="absolute -top-2.5 -right-3 rounded-full border border-[color:var(--color-primary)] bg-white px-1.5 py-0.5 text-11 font-extrabold leading-3 text-[color:var(--color-header-bottom-link)] transition-transform"
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
    <div v-show="searchBarVisible" class="flex select-none bg-[color:var(--color-search-bar-bg)] p-4">
      <VcInput
        v-model="searchPhrase"
        maxlength="64"
        :placeholder="$t('shared.layout.header.mobile.search_bar.input_placeholder')"
        class="mr-4 h-10 grow"
        input-class="!h-10 !px-4 font-medium text-sm"
        without-border
        @keyup.enter="searchPhrase && $router.push(searchPageLink)"
      />

      <VcButton :to="searchPhrase && searchPageLink" class="!h-10 w-10">
        <i class="fas fa-search text-lg" />
      </VcButton>

      <button class="ml-2 -mr-2 h-10 appearance-none px-2.5" @click="hideSearchBar">
        <i class="fas fa-times text-2xl text-white" />
      </button>
    </div>
    <!-- endregion Mobile Search Bar -->
  </div>

  <!-- Height placeholder for mobile header due to fixed position -->
  <div :style="placeholderStyle" class="h-14"></div>

  <!-- Mobile menu -->
  <transition
    enter-from-class="-translate-x-full"
    leave-to-class="-translate-x-full"
    enter-active-class="will-change-transform"
    leave-active-class="will-change-transform"
  >
    <MobileMenu v-if="mobileMenuVisible" class="transition-transform" @close="mobileMenuVisible = false" />
  </transition>
</template>

<script setup lang="ts">
import { useElementSize, whenever } from "@vueuse/core";
import { computed, ref, StyleValue, watch, watchEffect } from "vue";
import { RouteLocationRaw } from "vue-router";
import { useDomUtils, useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/constants";
import { numberToShortString } from "@/core/utilities";
import { useCart } from "@/shared/cart";
import { useNestedMobileHeader, useSearchBar } from "@/shared/layout";
import MobileMenu from "./mobile-menu.vue";

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
