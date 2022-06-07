<template>
  <div class="relative">
    <div class="px-[3.2rem] py-3 min-h-[5.5rem] flex items-center bg-[color:var(--color-header-bottom-bg)]">
      <router-link to="/">
        <VcImage :src="$cfg.logo_image" class="h-[2.8rem]" lazy />
      </router-link>

      <template v-if="organization">
        <div class="w-0.5 h-6 bg-[color:var(--color-primary)] mx-5 hidden xl:block"></div>

        <div class="italic leading-tight text-lg text-[color:var(--color-header-bottom-text)] hidden xl:block">
          {{ organization.name }}
        </div>
      </template>

      <Catalog
        v-if="catalog"
        class="ml-[1.85rem] px-[0.8rem] py-[0.55rem] border-2 border-primary rounded text-sm"
        :title="catalog.title"
        :to="catalog.route"
        :key="catalog.title"
        :children="catalog.children"
      >
      </Catalog>

      <SearchBar class="mx-5" />

      <div class="flex items-center pt-1.5 pl-4 pr-5 space-x-9 text-[13px]">
        <BottomHeaderLink
          v-for="item in desktopMenuLinks"
          :key="item.title"
          :to="item.route"
          :title="item.title"
          :icon="item.icon"
          :children="item.children"
        >
          <template v-if="item.id === 'checkout'">
            <span>{{ item.title }}</span>

            <transition name="slide-fade-right">
              <div
                v-if="cart?.itemsQuantity"
                class="flex items-center rounded-xl bg-white border border-[color:var(--color-primary)] px-1.5 font-bold text-xs h-5 absolute -top-[8px] left-5"
              >
                {{ cart.itemsQuantity }}
              </div>
            </transition>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { VcImage } from "@/components";
import Catalog from "./catalog.vue";
import BottomHeaderLink from "./bottom-header-link.vue";
import { useCart } from "@/shared/cart";
import { useSearchBar, SearchBar, useNavigations } from "@/shared/layout";
import { useCompareProducts } from "@/shared/compare";
import { useUser } from "@/shared/account";
const { t } = useI18n();

const { organization } = useUser();
const { cart } = useCart();
const { mainMenuLinks } = useNavigations();
const { productsIds } = useCompareProducts();
const { searchBarVisible, showSearchBar } = useSearchBar();

const isAnimatedSearchBar = ref(false);

const catalog = computed<MenuLink | undefined>(() =>
  mainMenuLinks.value.find((item) => item.id === "all-products-menu")
);

const desktopMenuLinks = [
  {
    id: "bulk-order",
    route: {
      name: "BulkOrder",
    },
    title: t("shared.layout.header.menu.bulk"),
    icon: "/static/images/dashboard/icons/bulk-order-desktop.svg#main",
  },
  {
    id: "compare",
    route: {
      name: "CompareProducts",
    },
    title: t("shared.layout.header.menu.compare"),
    icon: "/static/images/dashboard/icons/compare-desktop.svg#main",
  },
  {
    id: "lists",
    route: {
      name: "Lists",
    },
    title: t("shared.layout.header.menu.lists"),
    icon: "/static/images/dashboard/icons/lists.svg#main",
  },
  {
    id: "orders",
    route: {
      name: "Orders",
    },
    title: t("shared.layout.header.menu.orders"),
    icon: "/static/images/dashboard/icons/orders-desktop.svg#main",
  },
  {
    id: "checkout",
    route: {
      name: "Checkout",
    },
    title: t("shared.layout.header.menu.cart"),
    icon: "/static/images/checkout/cart-desktop.svg#main",
  },
];
</script>
