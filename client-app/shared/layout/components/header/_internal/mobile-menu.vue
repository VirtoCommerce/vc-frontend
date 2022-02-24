<template>
  <div class="fixed bg-gray-800 opacity-95 z-50 w-full h-screen flex flex-col">
    <div class="px-6 flex justify-between items-center h-14 flex-shrink-0">
      <router-link to="/" @click="$emit('close')">
        <VcImage src="/static/images/common/logo-white.svg" class="h-9" />
      </router-link>
      <i class="fas fa-times text-2xl text-yellow-500" @click="$emit('close')"></i>
    </div>

    <div class="flex-grow overflow-y-auto pb-16">
      <!-- Main menu items-->
      <div class="flex flex-col space-y-8 mt-8 px-10">
        <MobileMenuLink
          v-for="(item, i) in headerMenu"
          :key="i"
          :to="item.url"
          :children="item.children"
          :title="item.title"
          @close="$emit('close')"
        >
          <template v-if="item.id === 'checkout'">
            <div class="flex items-center">
              <i class="fas fa-shopping-cart text-yellow-500 mr-3"></i>
              <div>Cart</div>
              <div
                v-if="cart?.itemsQuantity"
                class="flex items-center rounded-2xl border border-yellow-500 px-3 font-bold text-sm h-7 ml-3"
              >
                {{ cart.itemsQuantity }}
              </div>
            </div>
          </template>
        </MobileMenuLink>
      </div>

      <!-- Menu divider -->
      <div class="h-px bg-gray-600 mt-10 mb-6"></div>

      <!-- My account and corporate blocks-->
      <div v-if="isAuthenticated" class="flex flex-col space-y-8 mt-8 px-10">
        <MobileMenuLink :children="myAccountMenu" @close="$emit('close')">My account</MobileMenuLink>
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
              <i class="fa fa-user-circle fa-2x fa-fw text-yellow-500"></i>
              <span class="ml-2 flex-1 font-semibold truncate">{{ me.contact?.fullName }}</span>
              <button
                class="ml-4 px-4 py-1 border-2 border-red-600 rounded uppercase text-sm font-roboto"
                @click="signOut"
              >
                Logout
              </button>
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
import { IMenuItem } from "@/shared/layout/types";
import { VcImage } from "@/components";

defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);

const { me, isAuthenticated, signMeOut } = useUser();
const { cart } = useCart();

const headerMenu = menuSchema?.header?.main;

const myAccountMenu = ref<IMenuItem[]>([
  { title: "Dashboard", url: "/account/dashboard" },
  { title: "Profile", url: "/account/profile" },
  { title: "Addresses", url: "/account/addresses" },
  { title: "Orders", url: "/account/orders" },
  { title: "Your List", url: "/account/lists" },
  { title: "Checkout Defaults", url: "/account/checkout-defaults" },
]);

/*
const corporateMenu = ref([
  { title: "Company Info", url: "/account/company" },
  { title: "Company Members", url: "/account/company-members" },
]);
*/

const unauthorizedMenu = ref([
  { title: "Sign In", url: "/sign-in" },
  { title: "Register now", url: "/sign-up" },
]);

async function signOut() {
  await signMeOut();
  location.href = "/";
}
</script>
