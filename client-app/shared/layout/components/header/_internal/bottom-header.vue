<template>
  <div class="relative bg-[--header-bottom-bg-color] text-[--header-bottom-text-color]">
    <nav
      ref="bottomHeader"
      class="relative z-[2] flex min-h-[5.5rem] items-center gap-x-5 bg-inherit px-5 py-3 xl:px-12"
    >
      <router-link :to="$context.settings.default_return_url ?? '/'">
        <VcImage :src="logoUrl" :alt="$context.storeName" class="h-8 xl:h-[2.8rem]" lazy />
      </router-link>

      <template v-if="organization">
        <div class="hidden h-6 w-0.5 bg-primary xl:block"></div>

        <div class="hidden max-w-36 text-base italic leading-[18px] text-neutral-800 xl:line-clamp-2">
          {{ organization?.name }}
        </div>
      </template>

      <!-- Catalog button -->
      <a
        ref="showCatalogMenuButton"
        :href="catalogLink"
        type="button"
        class="flex select-none items-center rounded border-2 border-primary px-[0.8rem] py-[0.55rem] text-sm text-[--header-bottom-link-color] hover:text-[--header-bottom-link-hover-color]"
        @click="toggleCatalogDropdown"
      >
        <span class="font-bold uppercase tracking-wide">
          {{ $t("shared.layout.header.bottom_header.catalog_menu_button") }}
        </span>

        <VcIcon v-if="catalogMenuItems.length" :name="catalogButtonIcon" size="xs" class="ml-3 text-primary" />
      </a>

      <SearchBar />

      <ul class="-mx-2 flex items-center">
        <li v-for="item in desktopMainMenuItems" :key="item.id">
          <BottomHeaderLink v-if="item.id === 'compare'" :link="item" :count="productsIds.length">
            {{ item.title }}
          </BottomHeaderLink>

          <BottomHeaderLink v-else-if="item.id === 'cart'" :link="item" :count="cart?.itemsQuantity">
            {{ item.title }}
          </BottomHeaderLink>

          <template v-else-if="item.id === 'push-messages'">
            <PushMessages
              v-if="$cfg.push_messages_enabled && isAuthenticated && isPushMessagesActive"
              :offset-options="20"
            >
              <template #trigger="{ totalCount, unreadCount }">
                <BottomHeaderLink :link="item" :count="unreadCount">
                  <template #icon>
                    <transition :name="unreadCount ? 'shake' : ''" mode="out-in">
                      <svg v-if="item.icon" :key="totalCount" height="24" width="24" class="mb-0.5 text-primary">
                        <use :href="item.icon" />
                      </svg>
                    </transition>
                  </template>
                  {{ item.title }}
                </BottomHeaderLink>
              </template>
            </PushMessages>
          </template>

          <BottomHeaderLink v-else :link="item">
            {{ item.title }}
          </BottomHeaderLink>
        </li>
      </ul>
    </nav>

    <!-- Catalog dropdown -->
    <transition
      v-if="catalogMenuItems.length"
      enter-from-class="-translate-y-full"
      leave-to-class="-translate-y-full"
      enter-active-class="will-change-transform"
      leave-active-class="will-change-transform"
    >
      <div
        v-if="catalogMenuVisible"
        ref="catalogMenuElement"
        class="absolute w-full overflow-y-auto bg-inherit shadow-md transition-transform duration-200"
        :style="catalogMenuStyle"
      >
        <CatalogMenu :items="catalogMenuItems" @select="catalogMenuVisible = false" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, syncRefs, useElementBounding, useScrollLock } from "@vueuse/core";
import { computed, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { useNavigations, useWhiteLabeling } from "@/core/composables";
import { useUser } from "@/shared/account/composables/useUser";
import { useShortCart } from "@/shared/cart";
import { useCompareProducts } from "@/shared/compare";
import { SearchBar } from "@/shared/layout";
import { usePushMessages } from "@/shared/push-messages/composables/usePushMessages";
import BottomHeaderLink from "./bottom-header-link.vue";
import CatalogMenu from "./catalog-menu.vue";
import type { StyleValue } from "vue";
import PushMessages from "@/shared/push-messages/components/push-messages.vue";

const router = useRouter();
const { isAuthenticated, organization } = useUser();
const { cart } = useShortCart();
const { logoUrl } = useWhiteLabeling();
const { catalogMenuItems, desktopMainMenuItems } = useNavigations();
const { productsIds } = useCompareProducts();
const { isActive: isPushMessagesActive } = usePushMessages();

const bottomHeader = ref<HTMLElement | null>(null);
const catalogMenuElement = shallowRef<HTMLElement | null>(null);
const showCatalogMenuButton = shallowRef<HTMLElement | null>(null);
const catalogMenuVisible = ref(false);

const { bottom } = useElementBounding(bottomHeader);

const catalogLink = router.resolve({ name: "Catalog" }).fullPath;
const catalogButtonIcon = computed<string>(() => (catalogMenuVisible.value ? "chevron-up" : "chevron-down"));
const catalogMenuStyle = computed<StyleValue | undefined>(() =>
  bottom.value ? { maxHeight: `calc(100vh - ${bottom.value}px)` } : undefined,
);

onClickOutside(
  catalogMenuElement,
  () => {
    catalogMenuVisible.value = false;
  },
  { ignore: [showCatalogMenuButton] },
);

syncRefs(catalogMenuVisible, useScrollLock(document.body));

function toggleCatalogDropdown(event: Event) {
  if (catalogMenuItems.value.length) {
    event.preventDefault();
    catalogMenuVisible.value = !catalogMenuVisible.value;
  }
}
</script>
