<template>
  <div class="relative">
    <div class="px-12 py-7 flex items-center justify-between bg-[color:var(--color-header-bottom-bg)]">
      <router-link to="/">
        <VcImage :src="$cfg.logo_image" class="h-12" />
      </router-link>
      <template v-if="organization">
        <div class="w-0.5 h-6 bg-[color:var(--color-primary)] mx-5 hidden xl:block"></div>

        <div class="italic leading-tight text-lg text-[color:var(--color-header-bottom-text)] hidden xl:block">
          {{ organization.name }}
        </div>
      </template>

      <div class="flex-grow"></div>

      <div class="flex items-center space-x-8 ml-8">
        <BottomHeaderLink
          v-for="(item, i) in headerMenu"
          :key="i"
          :to="item.url"
          :children="$menus[item.id]"
          :title="item.title"
        >
          <template v-if="item.id === 'checkout'">
            <div class="flex items-center">
              <i class="fas fa-shopping-cart text-[color:var(--color-primary)] mr-2" />

              <span>{{ item.title }}</span>

              <transition name="slide-fade-right">
                <div
                  v-if="cart?.itemsQuantity"
                  class="flex items-center rounded-xl border border-[color:var(--color-primary)] px-2 font-bold text-xs h-5 ml-2"
                >
                  {{ cart.itemsQuantity }}
                </div>
              </transition>
            </div>
          </template>

          <template v-else-if="item.id === 'compare'">
            <div class="flex items-center">
              <span>{{ item.title }}</span>

              <transition name="slide-fade-right">
                <div
                  v-if="productsIds.length"
                  class="flex items-center rounded-xl border border-[color:var(--color-primary)] px-2 font-bold text-xs h-5 ml-2"
                >
                  {{ productsIds.length }}
                </div>
              </transition>
            </div>
          </template>
        </BottomHeaderLink>

        <i class="fas fa-search text-[color:var(--color-primary)] cursor-pointer" @click="showSearchBar" />
      </div>
    </div>

    <!-- Desktop Search bar -->
    <transition
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
      enter-active-class="will-change-transform"
      leave-active-class="will-change-transform"
    >
      <SearchBar v-if="searchBarVisible" class="absolute top-0 w-full z-20 transition-transform duration-300" />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@/components";
import BottomHeaderLink from "./bottom-header-link.vue";
import menuSchema from "@/config/menu";
import { useCart } from "@/shared/cart";
import { useSearchBar, SearchBar } from "@/shared/layout";
import { useCompareProducts } from "@/shared/compare";
import { useUser } from "@/shared/account";

const { organization } = useUser();

const { cart } = useCart();
const { productsIds } = useCompareProducts();
const { searchBarVisible, showSearchBar } = useSearchBar();

const headerMenu = menuSchema?.header?.main;
</script>
