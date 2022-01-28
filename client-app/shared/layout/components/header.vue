<template>
  <!-- Desktop header -->
  <div class="header hidden lg:block">
    <!-- Top header -->
    <div class="h-12 px-12 flex items-center justify-end bg-gray-900 font-bold text-sm text-white">
      <!-- Authorized menu items -->
      <div v-if="isAuthenticated" class="flex items-center">
        <router-link class="text-blue-400 hover:text-blue-500" to="/account/dashboard">Dashboard</router-link>
        <div class="mx-3 h-1 w-1 bg-yellow-500 rounded"></div>
        <router-link class="text-blue-400 hover:text-blue-500" to="/404">Order History</router-link>
        <div class="mx-3 h-1 w-1 bg-yellow-500 rounded"></div>
        <router-link class="text-blue-400 hover:text-blue-500" to="/500">Lists</router-link>
        <div class="w-px h-5 bg-yellow-500 mx-4 hidden lg:block"></div>
        <div ref="loginMenu" class="relative cursor-pointer">
          <div class="text-white flex items-center" @click="loginMenuVisible = !loginMenuVisible">
            <div>{{ me.userName }}</div>
            <i class="fas fa-chevron-down ml-3 text-yellow-500 align-baseline"></i>
          </div>
          <div
            v-if="loginMenuVisible"
            class="absolute z-10 bg-white rounded-md shadow-lg flex flex-col px-3 py-4 space-y-3 mt-2 right-0 text-black"
          >
            <div class="flex items-center justify-between">
              <i class="fa fa-user-circle fa-2x fa-fw text-yellow-500"></i>
              <span class="ml-2">{{ me.userName }}</span>
              <button
                class="ml-4 text-gray-400 hover:bg-gray-200 border border-gray-200 rounded h-6 w-6 shadow"
                @click="signOut"
              >
                <i class="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Unauthorized menu items -->
      <div v-else class="flex items-center">
        <router-link class="text-blue-400 hover:text-blue-500" to="/sign-in">Sign In</router-link>
        <div class="mx-3 h-1 w-1 bg-yellow-500 rounded"></div>
        <router-link class="text-blue-400 hover:text-blue-500" to="/sign-up">Register now</router-link>
      </div>
    </div>

    <!-- Bottom header-->
    <div class="relative">
      <div class="px-12 py-7 flex items-center justify-between bg-white">
        <router-link to="/"><img src="/assets/static/images/common/logo.svg" class="h-12" /></router-link>
        <div class="w-0.5 h-6 bg-yellow-500 mx-5 hidden xl:block"></div>
        <div class="italic text-lg text-gray-900 hidden xl:block">Construction goods</div>
        <div class="flex-grow"></div>
        <div class="flex items-center space-x-8">
          <router-link to="/" class="menu-link uppercase font-extrabold text-gray-500">Home</router-link>
          <div ref="allProductsMenu" class="relative">
            <div
              class="uppercase font-extrabold text-gray-500 flex items-center cursor-pointer"
              @click="allProductsVisible = !allProductsVisible"
            >
              <div>All products</div>
              <i
                class="fas ml-3 text-yellow-500 align-baseline"
                :class="[allProductsVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
              ></i>
            </div>
            <div
              v-if="allProductsVisible"
              class="absolute z-10 bg-white rounded-md shadow-lg w-60 flex flex-col px-5 py-4 space-y-3 mt-2"
            >
              <router-link
                to="/catalog/carriage-bolts"
                class="font-bold text-gray-500 text-sm"
                @click="allProductsVisible = false"
                >Carriage Bolts</router-link
              >
              <router-link
                to="/catalog/flange-bolts"
                class="font-bold text-gray-500 text-sm"
                @click="allProductsVisible = false"
                >Flange Bolts</router-link
              >
              <router-link
                to="/catalog/multifunction-printers"
                class="font-bold text-gray-500 text-sm"
                @click="allProductsVisible = false"
                >Laser Printers</router-link
              >
              <router-link
                to="/catalog/all-in-one"
                class="font-bold text-gray-500 text-sm"
                @click="allProductsVisible = false"
                >Inkjet Printers</router-link
              >
            </div>
          </div>
          <div class="uppercase font-extrabold text-gray-500">Bulk order pad</div>
          <router-link to="/checkout" class="menu-link uppercase font-extrabold text-gray-500">
            <div class="flex items-center">
              <i class="fas fa-shopping-cart text-yellow-500 mr-3"></i>
              <div>Cart</div>
              <div
                v-if="cart?.itemsQuantity"
                class="flex items-center rounded-xl border border-yellow-500 px-2 font-bold text-xs h-5 ml-3"
              >
                {{ cart.itemsQuantity }}
              </div>
            </div>
          </router-link>
          <router-link to="/contact" class="menu-link uppercase font-extrabold text-gray-500">Contact Us</router-link>
          <i class="fas fa-search text-yellow-500 cursor-pointer" @click="searchVisible = true"></i>
        </div>
      </div>

      <!-- Header search bar -->
      <div
        v-if="searchVisible"
        class="absolute top-0 w-full z-10 px-12 py-7 flex items-center justify-between bg-gray-800 select-none"
      >
        <router-link to="/" @click="searchVisible = false">
          <img src="/assets/static/images/common/logo-white.svg" class="h-12" />
        </router-link>
        <input
          class="flex-grow ml-8 mr-4 rounded h-10 px-4 font-medium text-sm outline-none"
          placeholder="Enter keyword, item, model or replacement part number"
        />
        <i class="fas fa-search text-yellow-500 cursor-pointer" @click="searchVisible = false"></i>
      </div>
    </div>
  </div>

  <!-- Mobile header -->
  <div class="lg:hidden fixed z-10 bg-white w-full border-b shadow-md">
    <div class="px-6 flex justify-between items-center h-14">
      <router-link to="/"><img src="/assets/static/images/common/logo.svg" class="h-9" /></router-link>
      <i class="fas fa-bars text-2xl text-yellow-500" @click="mobileMenuVisible = true"></i>
    </div>
  </div>

  <!-- Placeholder for correct padding due to fixed mobile menu -->
  <div class="lg:hidden h-14"></div>

  <!-- Mobile menu -->
  <div v-if="mobileMenuVisible" class="fixed bg-gray-800 opacity-95 z-50 w-full h-screen flex flex-col">
    <div class="px-6 flex justify-between items-center h-14 flex-shrink-0">
      <router-link to="/" @click="mobileMenuVisible = false">
        <img src="/assets/static/images/common/logo-white.svg" class="h-9" />
      </router-link>
      <i class="fas fa-times text-2xl text-yellow-500" @click="mobileMenuVisible = false"></i>
    </div>

    <div class="flex-grow overflow-y-auto pb-16">
      <!-- Main menu items-->
      <div class="flex flex-col space-y-8 mt-8 px-10">
        <router-link to="/" class="uppercase text-xl font-extrabold text-white" @click="mobileMenuVisible = false"
          >Home</router-link
        >
        <div class="relative">
          <div
            class="uppercase text-xl font-extrabold text-white flex items-center"
            @click="allProductsMobileVisible = !allProductsMobileVisible"
          >
            <div>All products</div>
            <i
              class="fas ml-3 text-yellow-500 align-baseline"
              :class="[allProductsMobileVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
            ></i>
          </div>
          <div v-if="allProductsMobileVisible" class="flex flex-col px-5 py-2 space-y-3 mt-2">
            <router-link
              to="/catalog/carriage-bolts"
              class="font-bold text-gray-200 text-lg"
              @click="mobileMenuVisible = false"
              >Carriage Bolts</router-link
            >
            <router-link
              to="/catalog/flange-bolts"
              class="font-bold text-gray-200 text-lg"
              @click="mobileMenuVisible = false"
              >Flange Bolts</router-link
            >
            <router-link
              to="/catalog/multifunction-printers"
              class="font-bold text-gray-200 text-lg"
              @click="mobileMenuVisible = false"
              >Laser Printers</router-link
            >
            <router-link
              to="/catalog/all-in-one"
              class="font-bold text-gray-200 text-lg"
              @click="mobileMenuVisible = false"
              >Inkjet Printers</router-link
            >
          </div>
        </div>
        <div class="uppercase text-xl font-extrabold text-white">Bulk order pad</div>
        <router-link
          to="/checkout"
          class="uppercase text-xl font-extrabold text-white flex items-center"
          @click="mobileMenuVisible = false"
        >
          <i class="fas fa-shopping-cart text-yellow-500 mr-3"></i>
          <div>Cart</div>
          <div
            v-if="cart?.itemsQuantity"
            class="flex items-center rounded-2xl border border-yellow-500 px-3 font-bold text-sm h-7 ml-3"
          >
            {{ cart.itemsQuantity }}
          </div>
        </router-link>
        <router-link
          to="/contact"
          class="uppercase text-xl font-extrabold text-white"
          @click="mobileMenuVisible = false"
          >Contact Us</router-link
        >
      </div>

      <!-- Menu divider -->
      <div class="h-px bg-gray-600 mt-10 mb-6"></div>

      <!-- My account and corporate blocks-->
      <div v-if="isAuthenticated" class="flex flex-col space-y-8 mt-8 px-10">
        <div class="relative">
          <div
            class="uppercase text-xl font-extrabold text-white flex items-center"
            @click="myAccountMobileVisible = !myAccountMobileVisible"
          >
            <div>My account</div>
            <i
              class="fas ml-3 text-yellow-500 align-baseline"
              :class="[myAccountMobileVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
            ></i>
          </div>
          <div v-if="myAccountMobileVisible" class="flex flex-col px-5 py-2 space-y-3 mt-2">
            <router-link
              to="/account/dashboard"
              class="font-bold text-gray-200 text-lg"
              @click="mobileMenuVisible = false"
              >Dashboard</router-link
            >
            <router-link to="/profile" class="font-bold text-gray-200 text-lg" @click="mobileMenuVisible = false"
              >Profile</router-link
            >
            <router-link
              to="/account/addresses"
              class="font-bold text-gray-200 text-lg"
              @click="mobileMenuVisible = false"
              >Addresses</router-link
            >
            <router-link to="/orders" class="font-bold text-gray-200 text-lg" @click="mobileMenuVisible = false"
              >Orders</router-link
            >
            <router-link to="/yourList" class="font-bold text-gray-200 text-lg" @click="mobileMenuVisible = false"
              >Your list</router-link
            >
            <router-link
              to="/account/checkout-defaults"
              class="font-bold text-gray-200 text-lg"
              @click="mobileMenuVisible = false"
              >Checkout Defaults</router-link
            >
          </div>
        </div>
        <!-- Commented due to accetpance criteria, will be used in future-->
        <!-- <div class="relative">
          <div
            class="uppercase text-xl font-extrabold text-white flex items-center"
            @click="corporateMobileVisible = !corporateMobileVisible"
          >
            <div>Corporate</div>
            <i
              class="fas ml-3 text-yellow-500 align-baseline"
              :class="[corporateMobileVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
            ></i>
          </div>
          <div v-if="corporateMobileVisible" class="flex flex-col px-5 py-2 space-y-3 mt-2">
            <router-link to="/dashboard" class="font-bold text-gray-200 text-lg" @click="mobileMenuVisible = false"
              >Company Info</router-link
            >
            <router-link to="/profile" class="font-bold text-gray-200 text-lg" @click="mobileMenuVisible = false"
              >Company Members</router-link
            >
          </div>
        </div> -->
      </div>

      <!-- Menu divider -->
      <div v-if="isAuthenticated" class="h-px bg-gray-600 mt-10 mb-6"></div>

      <!-- Authorized menu items -->
      <div v-if="isAuthenticated" class="flex flex-col space-y-4 px-10">
        <div class="text-white">
          <div class="text-xl font-bold" @click="loginMobileMenuVisible = !loginMobileMenuVisible">
            <span>{{ me.userName }}</span>
            <i
              class="fas text-lg ml-3 text-yellow-500 align-baseline"
              :class="[loginMobileMenuVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
            ></i>
          </div>
          <div v-if="loginMobileMenuVisible" class="flex flex-col pl-2 py-2 space-y-3 mt-2">
            <div class="flex items-center max-w-sm">
              <i class="fa fa-user-circle fa-2x fa-fw text-yellow-500"></i>
              <span class="ml-2 flex-1 font-semibold">{{ me.userName }}</span>
              <button
                class="ml-4 px-4 py-1 border-2 border-red-600 rounded uppercase text-sm font-roboto"
                @click="signOut"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Unauthorized menu items -->
      <div v-else class="flex flex-col space-y-4 px-10">
        <router-link to="/sign-in" class="text-xl font-bold text-blue-500" @click="mobileMenuVisible = false"
          >Sign In</router-link
        >
        <router-link to="/sign-up" class="text-xl font-bold text-blue-500" @click="mobileMenuVisible = false"
          >Register now</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUser } from "@/shared/account";
import { onClickOutside } from "@vueuse/core";
import { useCart } from "@/shared/cart";
import { useContext } from "@/shared/context";
import { setUserId } from "@/core/constants";

const { isAuthenticated, me, signMeOut } = useUser();
const { loadMyCart } = useCart();
const { loadContext, themeContext } = useContext();
const { cart } = useCart();

const mobileMenuVisible = ref(false);
const searchVisible = ref(false);
const allProductsVisible = ref(false);
const allProductsMobileVisible = ref(false);
const myAccountMobileVisible = ref(false);
//Commented due to accetpance criteria, will be used in future
//const corporateMobileVisible = ref(false);
const allProductsMenu = ref(null);
const loginMenuVisible = ref(false);
const loginMobileMenuVisible = ref(false);
const loginMenu = ref(null);

onClickOutside(allProductsMenu, () => {
  allProductsVisible.value = false;
});

onClickOutside(loginMenu, () => {
  loginMenuVisible.value = false;
});

async function signOut() {
  await signMeOut();
  await loadContext();

  setUserId(themeContext.value?.userId || me.value?.id);
  await loadMyCart();
  loginMenuVisible.value = false;
}
</script>

<style>
.menu-link.router-link-active {
  position: relative;
}

.menu-link.router-link-active:after {
  content: "";
  height: 3px;
  background-color: #ffbe2e;
  position: absolute;
  width: 100%;
  margin-top: 5px;
  display: block;
}
</style>
