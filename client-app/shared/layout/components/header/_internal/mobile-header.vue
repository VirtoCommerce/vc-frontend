<template>
  <div ref="headerElement" class="fixed z-40 w-full bg-[--header-bottom-bg-color] shadow-md print:hidden">
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
            <VcIcon class="text-primary" name="menu" :size="32" />
          </button>

          <router-link :to="$context.settings.default_return_url ?? '/'">
            <VcImage :src="logoUrl" :alt="$context.storeName" class="h-8" lazy />
          </router-link>
        </div>
        <!-- endregion Left slot -->

        <!-- region Right slot -->
        <component :is="customSlots.right" v-if="customSlots.right" />

        <div v-else class="flex h-full flex-row items-center pr-4">
          <a v-if="support_phone_number" class="px-1 py-2 xs:px-2" :href="`tel:${support_phone_number}`">
            <VcIcon class="text-primary" name="phone" :size="28" />
          </a>

          <button type="button" class="px-1 py-2 xs:px-2" @click="toggleSearchBar">
            <VcIcon class="text-primary" name="search" :size="28" />
          </button>

          <PushMessages v-if="isPushMessagesActive" class="px-1 py-2 xs:px-2">
            <template #trigger="{ totalCount, unreadCount }">
              <div class="relative">
                <transition :name="unreadCount ? 'shake' : ''" mode="out-in">
                  <VcIcon :key="totalCount" class="text-primary" name="bell" :size="28" />
                </transition>

                <transition mode="out-in" name="scale">
                  <VcBadge
                    v-if="unreadCount"
                    variant="outline"
                    size="sm"
                    class="absolute -right-2 -top-2 transition-transform"
                    rounded
                  >
                    {{ unreadCount }}
                  </VcBadge>
                </transition>
              </div>
            </template>
          </PushMessages>

          <router-link :to="{ name: 'Cart' }" class="px-1 py-2 xs:px-2">
            <span class="relative block">
              <VcIcon class="text-primary" name="cart" :size="28" />

              <transition
                mode="out-in"
                enter-from-class="scale-0"
                leave-to-class="scale-0"
                enter-active-class="will-change-transform"
                leave-active-class="will-change-transform"
              >
                <VcBadge
                  v-if="cart?.itemsQuantity"
                  variant="outline"
                  size="sm"
                  class="absolute -right-2 -top-2 transition-transform"
                  rounded
                >
                  {{ $n(cart.itemsQuantity, { style: "decimal", notation: "compact" }) }}
                </VcBadge>
              </transition>
            </span>
          </router-link>
        </div>
        <!-- endregion Right slot -->
      </div>
    </transition>
    <!-- endregion Default slot -->

    <!-- region Mobile Search Bar -->
    <div v-show="searchBarVisible" class="flex select-none items-center bg-[--mobile-search-bar-bg] p-4">
      <VcInput
        v-model="searchPhrase"
        maxlength="64"
        :placeholder="$t('shared.layout.header.mobile.search_bar.input_placeholder')"
        class="mr-4 grow"
        no-border
        @keyup.enter="searchPhrase && $router.push(searchPageLink)"
      />

      <VcButton :to="searchPhrase && searchPageLink" icon="search" />

      <button type="button" class="-mr-2 ml-2 h-11 appearance-none px-3" @click="hideSearchBar">
        <VcIcon name="x" class="text-additional-50" />
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
    <MobileMenu
      v-if="mobileMenuVisible"
      class="transition-transform print:hidden"
      :class="{ 'is-visible': mobileMenuVisible }"
      @close="mobileMenuVisible = false"
    />
  </transition>
</template>

<script setup lang="ts">
import { syncRefs, useElementSize, useScrollLock, whenever } from "@vueuse/core";
import { computed, ref, watchEffect } from "vue";
import { useRouteQueryParam, useWhiteLabeling } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { QueryParamName } from "@/core/enums";
import { useShortCart } from "@/shared/cart";
import { useNestedMobileHeader, useSearchBar } from "@/shared/layout";
import { isActive as isPushMessagesActive } from "@/modules/push-messages/composables/usePushMessages";
import MobileMenu from "./mobile-menu/mobile-menu.vue";
import type { StyleValue } from "vue";
import type { RouteLocationRaw } from "vue-router";
import PushMessages from "@/modules/push-messages/components/push-messages.vue";

const searchPhrase = ref("");
const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
const mobileMenuVisible = ref(false);
const headerElement = ref(null);
const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);
const support_phone_number = getSettingValue(MODULE_XAPI_KEYS.SUPPORT_PHONE_NUMBER);

const { customSlots, isAnimated } = useNestedMobileHeader();
const { searchBarVisible, toggleSearchBar, hideSearchBar } = useSearchBar();
const { height } = useElementSize(headerElement);
const { cart } = useShortCart();
const { logoUrl } = useWhiteLabeling();

const placeholderStyle = computed<StyleValue | undefined>(() =>
  height.value ? { height: height.value + "px" } : undefined,
);

const searchPageLink = computed<RouteLocationRaw>(() => ({
  name: "Search",
  query: {
    [QueryParamName.SearchPhrase]: searchPhrase.value.trim(),
  },
}));

syncRefs(mobileMenuVisible, useScrollLock(document.body));

watchEffect(() => (searchPhrase.value = searchPhraseInUrl.value ?? ""));
whenever(searchBarVisible, () => (searchPhrase.value = searchPhraseInUrl.value ?? ""), { immediate: true });
</script>
