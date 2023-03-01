<template>
  <div class="relative">
    <div
      class="relative z-[2] flex min-h-[5.5rem] items-center gap-x-5 bg-[color:var(--color-header-bottom-bg)] px-5 py-3 xl:px-12"
    >
      <router-link to="/">
        <VcImage :src="$cfg.logo_image" :alt="$context.storeName" class="h-8 xl:h-[2.8rem]" lazy />
      </router-link>

      <template v-if="organization">
        <div class="hidden h-6 w-0.5 bg-[color:var(--color-primary)] xl:block"></div>

        <div
          class="hidden max-w-[9rem] text-base font-medium italic leading-[18px] text-[color:var(--color-header-bottom-text)] xl:line-clamp-2"
        >
          {{ organization?.name }}
        </div>
      </template>

      <!-- Catalog button -->
      <button
        ref="showCatalogMenuButton"
        type="button"
        class="flex cursor-pointer select-none items-center rounded border-2 border-primary px-[0.8rem] py-[0.55rem] text-sm text-[color:var(--color-header-bottom-link)] hover:text-[color:var(--color-header-bottom-link-hover)]"
        @click="catalogMenuVisible = !catalogMenuVisible"
      >
        <span
          v-t="'shared.layout.header.bottom_header.catalog_menu_button'"
          class="font-bold uppercase tracking-wide"
        />

        <i
          class="fas ml-3 align-baseline text-[color:var(--color-primary)]"
          :class="[catalogMenuVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
        />
      </button>

      <SearchBar />

      <div class="-mx-2 flex items-center">
        <template v-for="item in desktopHeaderMenuLinks" :key="item.id">
          <BottomHeaderLink v-if="item.id === 'compare'" :link="item" :count="productsIds.length">
            {{ item.title }}
          </BottomHeaderLink>

          <BottomHeaderLink v-else-if="item.id === 'cart'" :link="item" :count="cart.itemsQuantity">
            {{ item.title }}
          </BottomHeaderLink>

          <BottomHeaderLink v-else :link="item">
            {{ item.title }}
          </BottomHeaderLink>
        </template>
      </div>
    </div>

    <!-- Catalog dropdown -->
    <transition
      enter-from-class="-translate-y-full"
      leave-to-class="-translate-y-full"
      enter-active-class="will-change-transform"
      leave-active-class="will-change-transform"
    >
      <CatalogMenu
        v-if="catalogMenuVisible"
        ref="catalogMenuElement"
        class="absolute mt-[-1px] shadow-md transition-transform duration-200"
        @select="catalogMenuVisible = false"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { ref, shallowRef } from "vue";
import { useNavigations } from "@/core";
import { useUser } from "@/shared/account";
import { useCart } from "@/shared/cart";
import { useCompareProducts } from "@/shared/compare";
import { SearchBar } from "@/shared/layout";
import BottomHeaderLink from "./bottom-header-link.vue";
import CatalogMenu from "./catalog-menu.vue";

const { organization } = useUser();
const { cart } = useCart();
const { desktopHeaderMenuLinks } = useNavigations();
const { productsIds } = useCompareProducts();

const catalogMenuElement = shallowRef<HTMLElement | null>(null);
const showCatalogMenuButton = shallowRef<HTMLElement | null>(null);
const catalogMenuVisible = ref(false);

onClickOutside(
  catalogMenuElement,
  () => {
    catalogMenuVisible.value = false;
  },
  { ignore: [showCatalogMenuButton] }
);
</script>
