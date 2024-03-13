<template>
  <div ref="headerElement" class="fixed z-40 w-full bg-[color:var(--color-header-bottom-bg)] shadow-md print:hidden">
    <!-- region Default slot -->
    <transition :name="isAnimated ? 'slide-fade-top' : ''" mode="out-in">
      <div v-if="customSlots.default">
        <component :is="customSlots.default" />
      </div>

      <div v-else class="relative z-10 flex h-14 w-full items-center justify-between gap-x-2 sm:gap-x-6">
        <!-- region Left slot -->
        <component :is="customSlots.left" v-if="customSlots.left" />

        <div v-else class="flex h-full items-center">
          <button type="button" class="h-full pe-3 ps-5 sm:pe-5" @click="mobileMenuVisible = true">
            <VcIcon class="text-[--color-primary-500]" name="menu" :size="32" />
          </button>

          <router-link to="/">
            <VcImage :src="$cfg.logo_image" :alt="$context.storeName" class="h-8" lazy />
          </router-link>
        </div>
        <!-- endregion Left slot -->

        <!-- region Right slot -->
        <component :is="customSlots.right" v-if="customSlots.right" />

        <div v-else class="flex h-full flex-row items-center pr-4">
          <a v-if="$cfg.support_phone_number" class="px-1 py-2 xs:px-2" :href="`tel:${$cfg.support_phone_number}`">
            <VcIcon class="text-[--color-primary-500]" name="phone" :size="28" />
          </a>

          <button type="button" class="px-1 py-2 xs:px-2" @click="toggleSearchBar">
            <VcIcon class="text-[--color-primary-500]" name="search" :size="28" />
          </button>

          <PushMessages class="px-1 py-2 xs:px-2">
            <template #trigger="{ unreadCount }">
              <div class="relative">
                <VcIcon class="text-primary" name="bell" :size="28" />

                <VcTransitionScale mode="out-in">
                  <VcBadge variant="outline" size="sm" class="absolute -right-2 -top-2 transition-transform" rounded>
                    {{ unreadCount }}
                  </VcBadge>
                </VcTransitionScale>
              </div>
            </template>
          </PushMessages>

          <router-link :to="{ name: 'Cart' }" class="px-1 py-2 xs:px-2">
            <span class="relative block">
              <VcIcon class="text-[--color-primary-500]" name="cart" :size="28" />

              <VcTransitionScale mode="out-in">
                <VcBadge
                  v-if="cart?.itemsQuantity"
                  variant="outline"
                  size="sm"
                  class="absolute -right-2 -top-2 transition-transform"
                  rounded
                >
                  {{ $n(cart.itemsQuantity, "decimal", { notation: "compact" }) }}
                </VcBadge>
              </VcTransitionScale>
            </span>
          </router-link>
        </div>
        <!-- endregion Right slot -->
      </div>
    </transition>
    <!-- endregion Default slot -->

    <!-- region Mobile Search Bar -->
    <div v-show="searchBarVisible" class="flex select-none items-center bg-[color:var(--color-search-bar-bg)] p-4">
      <VcInput
        v-model.trim="searchPhrase"
        maxlength="64"
        :placeholder="$t('shared.layout.header.mobile.search_bar.input_placeholder')"
        class="mr-4 grow"
        no-border
        @keyup.enter="searchPhrase && $router.push(searchPageLink)"
      />

      <VcButton :to="searchPhrase && searchPageLink" icon="search" />

      <button type="button" class="-mr-2 ml-2 h-11 appearance-none px-3" @click="hideSearchBar">
        <VcIcon name="x" class="text-[--color-additional-50]" />
      </button>
    </div>
    <!-- endregion Mobile Search Bar -->
  </div>

  <!-- Height placeholder for mobile header due to fixed position -->
  <div :style="placeholderStyle" class="h-14 print:hidden"></div>

  <!-- Mobile menu -->
  <transition
    enter-from-class="-translate-x-full"
    leave-to-class="-translate-x-full"
    enter-active-class="will-change-transform"
    leave-active-class="will-change-transform"
  >
    <MobileMenu v-if="mobileMenuVisible" class="transition-transform print:hidden" @close="mobileMenuVisible = false" />
  </transition>
</template>

<script setup lang="ts">
import { syncRefs, useElementSize, useScrollLock, whenever } from "@vueuse/core";
import { computed, ref, watchEffect } from "vue";
import { useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import { useShortCart } from "@/shared/cart";
import { useNestedMobileHeader, useSearchBar } from "@/shared/layout";
import MobileMenu from "./mobile-menu.vue";
import type { StyleValue } from "vue";
import type { RouteLocationRaw } from "vue-router";
import PushMessages from "@/shared/push-messages/components/push-messages.vue";

const searchPhrase = ref("");
const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
const mobileMenuVisible = ref(false);
const headerElement = ref(null);

const { customSlots, isAnimated } = useNestedMobileHeader();
const { searchBarVisible, toggleSearchBar, hideSearchBar } = useSearchBar();
const { height } = useElementSize(headerElement);
const { cart } = useShortCart();

const placeholderStyle = computed<StyleValue | undefined>(() =>
  height.value ? { height: height.value + "px" } : undefined,
);

const searchPageLink = computed<RouteLocationRaw>(() => ({
  name: "Search",
  query: {
    [QueryParamName.SearchPhrase]: searchPhrase.value,
  },
}));

syncRefs(mobileMenuVisible, useScrollLock(document.body));

watchEffect(() => (searchPhrase.value = searchPhraseInUrl.value ?? ""));
whenever(searchBarVisible, () => (searchPhrase.value = searchPhraseInUrl.value ?? ""), { immediate: true });
</script>
