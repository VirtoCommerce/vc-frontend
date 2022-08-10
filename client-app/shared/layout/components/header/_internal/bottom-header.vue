<template>
  <div class="relative">
    <div
      class="z-[2] relative px-4 xl:px-[3.2rem] py-3 min-h-[5.5rem] flex items-center bg-[color:var(--color-header-bottom-bg)]"
    >
      <router-link to="/">
        <VcImage :src="$cfg.logo_image" class="h-8 xl:h-[2.8rem]" lazy />
      </router-link>

      <template v-if="organization">
        <div class="w-0.5 h-6 bg-[color:var(--color-primary)] mx-5 hidden xl:block"></div>

        <div class="italic leading-tight text-lg text-[color:var(--color-header-bottom-text)] hidden xl:block">
          {{ organization?.name }}
        </div>
      </template>

      <!-- Catalog button -->
      <button
        ref="showCatalogMenuButton"
        class="flex items-center ml-5 cursor-pointer select-none px-[0.8rem] py-[0.55rem] border-2 border-primary rounded text-sm text-[color:var(--color-header-bottom-link)] hover:text-[color:var(--color-header-bottom-link-hover)]"
        @click="catalogMenuVisible = !catalogMenuVisible"
      >
        <div class="uppercase font-bold tracking-wide">Catalog</div>

        <i
          class="fas ml-3 text-[color:var(--color-primary)] align-baseline"
          :class="[catalogMenuVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
        />
      </button>

      <SearchBar class="mx-5" />

      <div class="flex items-center pt-1.5 xl:pl-4 pr-5 space-x-5 xl:space-x-9">
        <template v-for="item in desktopHeaderMenuLinks" :key="item.id">
          <BottomHeaderLink
            v-if="item.id === 'compare'"
            :to="item.route"
            :title="item.title"
            :icon="item.icon"
            :badge="String(productsIds.length)"
          />
          <BottomHeaderLink
            v-else-if="item.id === 'checkout'"
            :to="item.route"
            :title="item.title"
            :icon="item.icon"
            :badge="String(cart.itemsQuantity)"
          />
          <BottomHeaderLink v-else :to="item.route" :title="item.title" :icon="item.icon" />
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
      <CatalogDropdown
        ref="catalogMenuElement"
        v-if="catalogMenuVisible"
        class="absolute transition-transform duration-200 shadow-md -mt-[1px]"
        @click-category="catalogMenuVisible = false"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from "vue";
import CatalogDropdown from "./catalog-dropdown.vue";
import BottomHeaderLink from "./bottom-header-link.vue";
import { useCart } from "@/shared/cart";
import { SearchBar, useNavigations } from "@/shared/layout";
import { useCompareProducts } from "@/shared/compare";
import { useUser } from "@/shared/account";
import { onClickOutside } from "@vueuse/core";

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
