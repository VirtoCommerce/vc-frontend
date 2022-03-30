<template>
  <div class="fixed bg-gray-800 opacity-95 z-50 w-full h-screen flex flex-col">
    <div class="px-6 flex justify-between items-center h-14 flex-shrink-0">
      <router-link to="/" @click="$emit('close')">
        <VcImage src="/static/images/common/logo-white.svg" class="h-9" />
      </router-link>
      <i class="fas fa-times text-2xl text-[color:var(--color-primary)]" @click="$emit('close')"></i>
    </div>

    <div class="flex-grow overflow-y-auto pb-16">
      <!-- Main menu items-->
      <div class="flex flex-col space-y-8 mt-8 px-10">
        <MobileMenuLink
          v-for="(item, i) in headerMenu"
          :key="i"
          :to="item.url"
          :children="$menus[item.id]"
          :title="item.title"
          @close="$emit('close')"
        >
          <template v-if="item.id === 'checkout'">
            <div class="flex items-center">
              <i class="fas fa-shopping-cart text-[color:var(--color-primary)] mr-3" />

              <span>{{ item.title }}</span>

              <div
                v-if="cart?.itemsQuantity"
                class="flex items-center rounded-2xl border border-[color:var(--color-primary)] px-3 font-bold text-sm h-7 ml-3"
              >
                {{ cart.itemsQuantity }}
              </div>
            </div>
          </template>

          <template v-else-if="item.id === 'compare'">
            <div class="flex items-center">
              <span>{{ item.title }}</span>

              <div
                v-if="productsIds.length"
                class="flex items-center rounded-2xl border border-[color:var(--color-primary)] px-3 font-bold text-sm h-7 ml-3"
              >
                {{ productsIds.length }}
              </div>
            </div>
          </template>
        </MobileMenuLink>
      </div>

      <!-- Menu divider -->
      <div class="h-px bg-gray-600 mt-10 mb-6"></div>

      <!-- My account and corporate blocks-->
      <div v-if="isAuthenticated" class="flex flex-col space-y-8 mt-8 px-10">
        <MobileMenuLink :children="myAccountMenu" @close="$emit('close')">{{
          $t("shared.layout.header.menu.my_account")
        }}</MobileMenuLink>
        <!-- Commented due to accetpance criteria, will be used in future-->
        <!-- <MobileMenuLink :children="corporateMenu">Corporate</MobileMenuLink> -->
      </div>

      <!-- Menu divider -->
      <div v-if="isAuthenticated" class="h-px bg-gray-600 mt-10 mb-6"></div>

      <!-- Authorized menu items -->
      <div v-if="isAuthenticated" class="flex flex-col space-y-4 px-10">
        <MobileMenuLink :children="[{ title: '' }]" @close="$emit('close')">
          {{ me.contact?.fullName }}
          <template #item>
            <div class="text-white flex items-center max-w-sm">
              <i class="fa fa-user-circle fa-2x fa-fw text-[color:var(--color-primary)]"></i>
              <span class="ml-2 flex-1 font-semibold truncate">{{ me.contact?.fullName }}</span>
              <button
                class="ml-4 px-4 py-1 border-2 border-red-600 rounded uppercase text-sm font-roboto"
                @click="signOut"
                v-t="'shared.layout.header.link_logout'"
              ></button>
            </div>
          </template>
        </MobileMenuLink>
      </div>

      <!-- Unauthorized menu items -->
      <div v-else class="flex flex-col space-y-4 px-10">
        <MobileMenuLink
          v-for="(item, i) in unauthorizedMenu"
          :key="i"
          class="text-xl font-bold text-blue-500 normal-case"
          :title="item.title"
          :to="item.url"
          @close="$emit('close')"
        ></MobileMenuLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileMenuLink from "./mobile-menu-link.vue";
import menuSchema from "@/config/menu";
import { useCart } from "@/shared/cart";
import { useUser } from "@/shared/account";
import { ref } from "vue";
import { MenuLinkType } from "@/core/api/graphql/types";
import { VcImage } from "@/components";
import { useI18n } from "vue-i18n";
import { useCompareProducts } from "@/shared/compare";

defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);

const { me, isAuthenticated, signMeOut } = useUser();
const { cart } = useCart();
const { productsIds } = useCompareProducts();
const { t } = useI18n();

const headerMenu = menuSchema?.header?.main;

const myAccountMenu = ref<MenuLinkType[]>([
  { title: t("shared.layout.header.mobile.account_menu.dashboard"), url: "/account/dashboard" },
  { title: t("shared.layout.header.mobile.account_menu.profile"), url: "/account/profile" },
  { title: t("shared.layout.header.mobile.account_menu.addresses"), url: "/account/addresses" },
  { title: t("shared.layout.header.mobile.account_menu.orders"), url: "/account/orders" },
  { title: t("shared.layout.header.mobile.account_menu.your_lists"), url: "/account/lists" },
  { title: t("shared.layout.header.mobile.account_menu.checkout_defaults"), url: "/account/checkout-defaults" },
]);

/*
const corporateMenu = ref([
  { title: "Company Info", url: "/account/company" },
  { title: "Company Members", url: "/account/company-members" },
]);
*/

const unauthorizedMenu = ref<MenuLinkType[]>([
  { title: t("shared.layout.header.link_sign_in"), url: "/sign-in" },
  { title: t("shared.layout.header.link_register_now"), url: "/sign-up" },
]);

async function signOut() {
  await signMeOut();
  location.href = "/";
}
</script>
