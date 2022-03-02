<template>
  <div class="relative">
    <div class="px-12 py-7 flex items-center justify-between bg-white">
      <router-link to="/">
        <VcImage src="/static/images/common/logo.svg" class="h-12" />
      </router-link>

      <div class="w-0.5 h-6 bg-yellow-500 mx-5 hidden xl:block"></div>
      <div class="italic text-lg text-gray-900 hidden xl:block">Construction goods</div>
      <div class="flex-grow"></div>

      <div class="flex items-center space-x-8">
        <BottomHeaderLink
          v-for="(item, i) in headerMenu"
          :key="i"
          :to="item.url"
          :children="item.children"
          :title="item.title"
        >
          <template v-if="item.id === 'checkout'">
            <div class="flex items-center">
              <i class="fas fa-shopping-cart text-yellow-500 mr-3"></i>
              <div>{{ item.title }}</div>
              <div
                v-if="cart?.itemsQuantity"
                class="flex items-center rounded-xl border border-yellow-500 px-2 font-bold text-xs h-5 ml-3"
              >
                {{ cart.itemsQuantity }}
              </div>
            </div>
          </template>
        </BottomHeaderLink>

        <i class="fas fa-search text-yellow-500 cursor-pointer" @click="showSearchBar" />
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

const { cart } = useCart();
const { searchBarVisible, showSearchBar } = useSearchBar();

const headerMenu = menuSchema?.header?.main;
</script>
