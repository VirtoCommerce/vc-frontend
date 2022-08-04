<template>
  <div class="relative">
    <div class="px-4 xl:px-[3.2rem] py-3 min-h-[5.5rem] flex items-center bg-[color:var(--color-header-bottom-bg)]">
      <router-link to="/">
        <VcImage :src="$cfg.logo_image" class="h-8 xl:h-[2.8rem]" lazy />
      </router-link>

      <template v-if="organization">
        <div class="w-0.5 h-6 bg-[color:var(--color-primary)] mx-5 hidden xl:block"></div>

        <div class="italic leading-tight text-lg text-[color:var(--color-header-bottom-text)] hidden xl:block">
          {{ organization?.name }}
        </div>
      </template>

      <CatalogDropdown
        v-if="catalogMenuLink"
        class="ml-5 xl:ml-[1.85rem]"
        :title="catalogMenuLink.title"
        :to="catalogMenuLink.route"
        :children="catalogMenuLink.children"
      />

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
          <BottomHeaderLink v-else :key="item.title" :to="item.route" :title="item.title" :icon="item.icon" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CatalogDropdown from "./catalog-dropdown.vue";
import BottomHeaderLink from "./bottom-header-link.vue";
import { useCart } from "@/shared/cart";
import { SearchBar, useNavigations } from "@/shared/layout";
import { useCompareProducts } from "@/shared/compare";
import { useUser } from "@/shared/account";

const { organization } = useUser();
const { cart } = useCart();
const { mobileCatalogMenuLink: catalogMenuLink, desktopHeaderMenuLinks } = useNavigations();
const { productsIds } = useCompareProducts();
</script>
