<template>
  <div
    class="h-12 px-12 flex items-center justify-between bg-[color:var(--color-header-top-bg)] font-bold text-sm text-[color:var(--color-header-top-text)]"
  >
    <div class="flex space-x-8 items-center">
      <LanguageSelector v-if="$context.availLanguages && $context.availLanguages.length > 1" />
      <CurrencySelector v-if="$context.availCurrencies && $context.availCurrencies.length > 1" />
    </div>

    <div class="flex items-center">
      <!-- Call us block -->
      <div class="flex items-center" v-if="$cfg.support_phone_number">
        <i class="fas fa-phone-alt text-[color:var(--color-primary)] mr-1"></i>
        <div class="font-thin mr-1">{{ $t("shared.layout.header.top_header.call_us") }}</div>
        <a
          class="font-semibold text-[color:var(--color-header-top-link)] hover:text-[color:var(--color-header-top-link-hover)]"
          :href="`tel:${$cfg.support_phone_number}`"
        >
          {{ $cfg.support_phone_number }}
        </a>
        <div class="w-px h-5 bg-[color:var(--color-primary)] mx-4 hidden lg:block"></div>
      </div>

      <!-- Authorized menu items -->
      <div class="flex items-center" v-if="isAuthenticated">
        <TopHeaderLink to="/account/dashboard" v-t="'shared.layout.header.top_header.link_dashboard'"></TopHeaderLink>
        <div class="mx-3 h-1 w-1 bg-[color:var(--color-primary)] rounded"></div>
        <TopHeaderLink to="/account/orders" v-t="'shared.layout.header.top_header.link_order_history'"></TopHeaderLink>
        <div class="mx-3 h-1 w-1 bg-[color:var(--color-primary)] rounded"></div>
        <TopHeaderLink :to="{ name: 'Lists' }" v-t="'shared.layout.header.top_header.link_lists'"></TopHeaderLink>
        <div class="w-px h-5 bg-[color:var(--color-primary)] mx-4 hidden lg:block"></div>

        <!-- Account menu -->
        <div ref="loginMenu" class="relative">
          <div class="flex items-center cursor-pointer" @click="loginMenuVisible = !loginMenuVisible">
            <div>{{ user.contact?.fullName }}</div>
            <i class="fas fa-chevron-down ml-3 text-[color:var(--color-primary)] align-baseline"></i>
          </div>
          <div
            v-if="loginMenuVisible"
            class="absolute z-10 bg-white rounded-md shadow-lg flex flex-col px-3 py-4 space-y-3 mt-2 right-0 text-black w-60"
          >
            <div class="flex items-center justify-between">
              <router-link to="/account/dashboard" class="flex items-center" @click="loginMenuVisible = false">
                <i class="fa fa-user-circle fa-2x fa-fw text-[color:var(--color-primary)]"></i>
                <span class="ml-2">{{ user.contact?.fullName }}</span>
              </router-link>
              <div class="flex-grow"></div>
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
      <div class="flex items-center" v-else>
        <TopHeaderLink to="/sign-in" v-t="'shared.layout.header.link_sign_in'"></TopHeaderLink>
        <div class="mx-3 h-1 w-1 bg-[color:var(--color-primary)] rounded"></div>
        <TopHeaderLink to="/sign-up" v-t="'shared.layout.header.link_register_now'"></TopHeaderLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import { CurrencySelector, LanguageSelector } from "@/shared/layout";
import { useUser } from "@/shared/account";

import TopHeaderLink from "./top-header-link.vue";

const { isAuthenticated, user, signMeOut } = useUser();
const loginMenu = ref(null);
const loginMenuVisible = ref(false);

async function signOut() {
  await signMeOut();
  location.href = "/";
}

onClickOutside(loginMenu, () => {
  loginMenuVisible.value = false;
});
</script>
