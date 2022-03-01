<template>
  <div class="fixed z-40 w-full shadow-md">
    <div class="relative z-10 h-14 flex justify-between items-center bg-white">
      <router-link to="/" class="px-6">
        <VcImage src="/static/images/common/logo.svg" class="h-9" lazy />
      </router-link>

      <div class="flex items-center h-full pr-3">
        <button v-show="!searchBarVisible" class="h-full px-3" @click="showSearchBar">
          <i class="fas fa-search text-lg text-yellow-500" />
        </button>

        <button class="h-full px-3" @click="mobileMenuVisible = true">
          <i class="fas fa-bars text-2xl text-yellow-500" />
        </button>
      </div>
    </div>

    <!-- Mobile Search Bar -->
    <div v-show="searchBarVisible" class="flex p-4 bg-gray-800 select-none">
      <input
        v-model.trim="searchPhrase"
        maxlength="30"
        placeholder="Enter keyword, item, model or replacement part number"
        class="flex-grow mr-4 rounded h-10 px-4 font-medium text-sm outline-none disabled:bg-gray-200"
        @keyup.enter="$router.push(searchPageLink)"
      />

      <VcButton class="w-10 h-10" :to="searchPageLink">
        <i class="fas fa-search text-lg" />
      </VcButton>

      <button @click="hideSearchBar" class="h-10 px-2.5 ml-2 -mr-2 appearance-none">
        <i class="fas fa-times text-2xl text-white" />
      </button>
    </div>
  </div>

  <!-- Height placeholder for mobile header due to fixed position -->
  <div class="h-14"></div>

  <!-- Height placeholder for search bar due to fixed mobile header -->
  <div v-show="searchBarVisible" class="h-16 mt-2"></div>

  <!-- Mobile menu -->
  <MobileMenu v-if="mobileMenuVisible" @close="mobileMenuVisible = false" />
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { RouteLocationRaw } from "vue-router";
import { VcButton, VcImage } from "@/components";
import { useSearchBar } from "@/shared/layout";
import MobileMenu from "./mobile-menu.vue";
import { useRouteQueryParam } from "@core/composables";
import QueryParamName from "@core/query-param-name.enum";
import { whenever } from "@vueuse/core";
import { defaultMobilePageSize } from "@core/constants";

const { searchBarVisible, showSearchBar, hideSearchBar } = useSearchBar();

const searchPhrase = ref("");
const searchPhraseInUrl = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
const mobileMenuVisible = ref(false);

const searchPageLink = computed<RouteLocationRaw>(() => ({
  name: "Search",
  query: {
    [QueryParamName.SearchPhrase]: searchPhrase.value,
    [QueryParamName.ItemsPerPage]: defaultMobilePageSize,
  },
}));

watchEffect(() => (searchPhrase.value = searchPhraseInUrl.value ?? ""));
whenever(searchBarVisible, () => (searchPhrase.value = searchPhraseInUrl.value ?? ""), { immediate: true });
</script>
