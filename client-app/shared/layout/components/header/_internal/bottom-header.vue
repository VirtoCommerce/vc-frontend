<template>
  <div class="relative">
    <div class="px-12 py-7 flex items-center justify-between bg-white">
      <router-link to="/"><VcImage src="/static/images/common/logo.svg" class="h-12" /></router-link>
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
        <i class="fas fa-search text-yellow-500 cursor-pointer" @click="searchVisible = true"></i>
      </div>
    </div>

    <!-- Header search bar -->
    <div
      v-if="searchVisible"
      class="absolute top-0 w-full z-10 px-12 py-7 flex items-center justify-between bg-gray-800 select-none"
    >
      <router-link to="/" @click="searchVisible = false">
        <VcImage src="/static/images/common/logo-white.svg" class="h-12" />
      </router-link>
      <input
        class="flex-grow ml-8 mr-4 rounded h-10 px-4 font-medium text-sm outline-none"
        placeholder="Enter keyword, item, model or replacement part number"
      />
      <i class="fas fa-search text-yellow-500 cursor-pointer" @click="searchVisible = false"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@/components";
import BottomHeaderLink from "./bottom-header-link.vue";
import menuSchema from "@/config/menu";
import { ref } from "vue";
import { useCart } from "@/shared/cart";

const { cart } = useCart();

const headerMenu = menuSchema?.header?.main;

const searchVisible = ref(false);
</script>
