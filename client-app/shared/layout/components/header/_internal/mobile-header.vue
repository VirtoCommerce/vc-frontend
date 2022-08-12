<template>
  <div ref="headerElement" class="fixed z-40 w-full shadow-md bg-[color:var(--color-header-bottom-bg)]">
    <!-- region Default slot -->
    <transition :name="isAnimated ? 'slide-fade-top' : ''" mode="out-in">
      <div v-if="customSlots.default">
        <component :is="customSlots.default" />
      </div>

      <div v-else class="relative w-full z-10 h-14 flex justify-between items-center">
        <!-- region Left slot -->
        <component v-if="customSlots.left" :is="customSlots.left" />

        <div v-else class="flex items-center h-full px-6">
          <button class="h-full mr-6" @click="mobileMenuVisible = true">
            <i class="fas fa-bars text-2xl text-[color:var(--color-primary)]" />
          </button>
          <router-link to="/">
            <VcImage :src="$cfg.logo_image" class="h-8" lazy />
          </router-link>
        </div>
        <!-- endregion Left slot -->

        <!-- region Right slot -->
        <component v-if="customSlots.right" :is="customSlots.right" />

        <div v-else class="flex items-center h-full pr-8">
          <a class="pr-4 pt-0.5" :href="`tel:${$cfg.support_phone_number}`" v-if="$cfg.support_phone_number">
            <i class="fas fa-phone-alt text-xl text-[color:var(--color-primary)]"></i>
          </a>

          <button class="h-full pr-4" @click="toggleSearchBar">
            <i class="fas fa-search text-2xl text-[color:var(--color-primary)]" />
          </button>

          <router-link to="/checkout">
            <i class="fas fa-shopping-cart text-xl text-[color:var(--color-primary)]" />
          </router-link>
        </div>
        <!-- endregion Right slot -->
      </div>
    </transition>
    <!-- endregion Default slot -->

    <!-- region Mobile Search Bar -->
    <div v-show="searchBarVisible" class="flex p-4 bg-[color:var(--color-search-bar-bg)] select-none">
      <input
        v-model.trim="searchPhrase"
        maxlength="30"
        :placeholder="$t('shared.layout.header.mobile.search_bar.input_placeholder')"
        class="flex-grow mr-4 rounded h-10 px-4 font-medium text-sm outline-none disabled:bg-gray-200"
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
    <MobileMenu v-if="mobileMenuVisible" @close="mobileMenuVisible = false" class="transition-transform duration-150" />
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

const searchPhrase = ref("");
const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
const mobileMenuVisible = ref(false);
const headerElement = ref<HTMLElement | null>(null);

const { customSlots, isAnimated } = useNestedMobileHeader();
const { searchBarVisible, toggleSearchBar, hideSearchBar } = useSearchBar();
const { toggleBodyScrollable } = useDomUtils();
const { height } = useElementSize(headerElement);

const placeholderStyle = computed<StyleValue | undefined>(() =>
  height.value ? { height: height.value + "px" } : undefined
);

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
