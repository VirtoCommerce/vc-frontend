<template>
  <div class="relative">
    <div
      class="z-[2] relative px-5 xl:px-12 py-3 min-h-[5.5rem] flex items-center gap-x-5 bg-[color:var(--color-header-bottom-bg)]"
    >
      <router-link to="/">
        <VcImage :src="$cfg.logo_image" :alt="$context.storeName" class="h-8 xl:h-[2.8rem]" lazy />
      </router-link>

      <template v-if="organization">
        <div class="w-0.5 h-6 bg-[color:var(--color-primary)] hidden xl:block"></div>

        <div
          class="hidden xl:line-clamp-2 max-w-[9rem] text-base leading-[18px] font-medium italic text-[color:var(--color-header-bottom-text)]"
        >
          {{ organization?.name }}
        </div>
      </template>

      <!-- Catalog button -->
      <button
        ref="showCatalogMenuButton"
        class="flex items-center cursor-pointer select-none px-[0.8rem] py-[0.55rem] border-2 border-primary rounded text-sm text-[color:var(--color-header-bottom-link)] hover:text-[color:var(--color-header-bottom-link-hover)]"
        @click="catalogMenuVisible = !catalogMenuVisible"
      >
        <span
          v-t="'shared.layout.header.bottom_header.catalog_menu_button'"
          class="uppercase font-bold tracking-wide"
        />

        <i
          class="fas ml-3 text-[color:var(--color-primary)] align-baseline"
          :class="[catalogMenuVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
        />
      </button>

      <SearchBar />

      <div class="flex items-center -mx-2">
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
        class="absolute transition-transform duration-200 shadow-md mt-[-1px]"
        @select="catalogMenuVisible = false"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useNavigations } from "@/core";
import { useCart } from "@/shared/cart";
import { SearchBar } from "@/shared/layout";
import { useCompareProducts } from "@/shared/compare";
import { useUser } from "@/shared/account";
import CatalogMenu from "./catalog-menu.vue";
import BottomHeaderLink from "./bottom-header-link.vue";

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
