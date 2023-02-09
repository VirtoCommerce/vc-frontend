<template>
  <div
    class="flex items-center justify-between h-[39px] px-5 xl:px-12 bg-[color:var(--color-header-top-bg)] text-sm text-[color:var(--color-header-top-text)]"
  >
    <div class="flex space-x-6 items-center">
      <LanguageSelector v-if="$context.availLanguages && $context.availLanguages.length > 1" />
      <CurrencySelector v-if="$context.availCurrencies && $context.availCurrencies.length > 1" />
    </div>

    <div class="flex items-center text-13">
      <!-- Call us block -->
      <div v-if="$cfg.support_phone_number" class="flex items-center">
        <i class="fas fa-phone text-[color:var(--color-primary)] mr-1.5 mt-0.5" />

        <span v-t="'shared.layout.header.top_header.call_us_label'" class="font-thin mr-1" />

        <a
          class="py-1 font-semibold text-[color:var(--color-header-top-link)] hover:text-[color:var(--color-header-top-link-hover)]"
          :href="`tel:${$cfg.support_phone_number}`"
        >
          {{ $cfg.support_phone_number }}
        </a>

        <span class="w-px h-5 bg-[color:var(--color-primary)] mx-4" />
      </div>

      <!-- Authorized menu items -->
      <template v-if="isAuthenticated">
        <TopHeaderLink to="/account/dashboard">
          {{ $t("shared.layout.header.top_header.link_dashboard") }}
        </TopHeaderLink>

        <span class="mx-2 h-1 w-1 bg-[color:var(--color-primary)] rounded-full" />

        <TopHeaderLink to="/contact">
          {{ $t("shared.layout.header.top_header.link_contact_us") }}
        </TopHeaderLink>

        <span class="w-px h-5 bg-[color:var(--color-primary)] mx-4" />

        <!-- Account menu -->
        <div ref="loginMenu" class="relative flex flex-row items-center gap-x-1">
          <!-- Operator -->
          <template v-if="operator">
            <span class="font-bold">{{ operator.contact?.fullName || operator.userName }}</span>
            <span v-t="'shared.layout.header.top_header.logged_in_as'" class="text-gray-400" />
          </template>

          <button
            class="flex items-center py-1 cursor-pointer text-white hover:text-[color:var(--color-header-top-link)]"
            @click="loginMenuVisible = !loginMenuVisible"
          >
            <span class="font-bold">{{ user.contact?.fullName || user.userName }}</span>

            <i
              class="fas ml-1 text-[color:var(--color-primary)] text-[0.625rem] align-baseline"
              :class="[loginMenuVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
            />
          </button>

          <div
            v-if="loginMenuVisible"
            class="absolute z-10 bg-white rounded-md shadow-md flex flex-col px-3 py-4 space-y-3 top-full right-0 text-black w-60"
          >
            <div class="flex items-center justify-between">
              <router-link
                to="/account/dashboard"
                class="flex items-center hover:text-[color:var(--color-primary)]"
                @click="loginMenuVisible = false"
              >
                <i class="fa fa-user-circle fa-2x fa-fw text-[color:var(--color-primary)]" />
                <span class="ml-2">{{ user.contact?.fullName }}</span>
              </router-link>

              <div class="flex-grow"></div>

              <button
                :title="$t('shared.layout.header.link_logout')"
                class="ml-4 text-gray-400 hover:bg-gray-200 border border-gray-200 rounded h-6 w-6 shadow"
                @click="signOut"
              >
                <i class="fas fa-sign-out-alt" />
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Unauthorized menu items -->
      <template v-else>
        <TopHeaderLink to="/contact">
          {{ $t("shared.layout.header.top_header.link_contact_us") }}
        </TopHeaderLink>

        <span class="w-px h-5 bg-[color:var(--color-primary)] mx-4" />

        <TopHeaderLink to="/sign-in">
          {{ $t("shared.layout.header.link_sign_in") }}
        </TopHeaderLink>

        <span class="mx-3 h-1 w-1 bg-[color:var(--color-primary)] rounded-full" />

        <TopHeaderLink to="/sign-up">
          {{ $t("shared.layout.header.link_register_now") }}
        </TopHeaderLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import { CurrencySelector, LanguageSelector } from "@/shared/layout";
import { useUser } from "@/shared/account";

import TopHeaderLink from "./top-header-link.vue";

const { isAuthenticated, user, operator, signMeOut } = useUser();
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
