<template>
  <div
    class="flex h-[39px] items-center gap-x-5 bg-[color:var(--color-header-top-bg)] px-5 text-sm text-[color:var(--color-header-top-text)] xl:px-12"
  >
    <LanguageSelector v-if="$context.availableLanguages && $context.availableLanguages.length > 1" />
    <CurrencySelector v-if="$context.availableCurrencies && $context.availableCurrencies.length > 1" class="h-full" />

    <div class="ms-auto flex items-center">
      <!-- Call us block -->
      <div v-if="$cfg.support_phone_number" class="flex items-center">
        <VcIcon class="me-1.5 text-[--color-primary-500]" name="phone" size="sm" />

        <span v-t="'shared.layout.header.top_header.call_us_label'" class="mr-1 font-thin" />

        <a
          class="py-1 font-semibold text-[color:var(--color-header-top-link)] hover:text-[color:var(--color-header-top-link-hover)]"
          :href="`tel:${$cfg.support_phone_number}`"
        >
          {{ $cfg.support_phone_number }}
        </a>

        <span class="mx-4 h-5 w-px bg-[color:var(--color-primary)]" />
      </div>

      <!-- Authorized menu items -->
      <template v-if="isAuthenticated">
        <TopHeaderLink to="/account/dashboard">
          {{ $t("shared.layout.header.top_header.link_dashboard") }}
        </TopHeaderLink>

        <span class="mx-2 size-1 rounded-full bg-[color:var(--color-primary)]" />

        <TopHeaderLink to="/contacts">
          {{ $t("shared.layout.header.top_header.link_contact_us") }}
        </TopHeaderLink>

        <span class="mx-4 h-5 w-px bg-[color:var(--color-primary)]" />

        <!-- Account menu -->
        <div ref="loginMenu" class="relative flex flex-row items-center gap-x-1">
          <!-- Operator -->
          <template v-if="operator">
            <span class="font-bold">{{ operator.contact?.fullName || operator.userName }}</span>
            <span v-t="'shared.layout.header.top_header.logged_in_as'" class="text-gray-400" />
          </template>

          <button
            type="button"
            class="flex cursor-pointer items-center py-1 text-white hover:text-[color:var(--color-header-top-link)]"
            @click="loginMenuVisible = !loginMenuVisible"
          >
            <span class="font-bold">{{ user.contact?.fullName || user.userName }}</span>

            <VcIcon
              class="ms-1.5 text-[--color-accent-200] [--vc-icon-size:1rem] lg:text-[--color-primary-500] lg:[--vc-icon-size:0.625rem]"
              :name="loginMenuVisible ? 'chevron-up' : 'chevron-down'"
            />
          </button>

          <div
            v-if="loginMenuVisible"
            class="absolute right-0 top-full z-10 flex w-60 flex-col space-y-3 rounded-md bg-white px-3 py-4 text-black shadow-md"
          >
            <div class="flex items-center justify-between">
              <router-link
                to="/account/dashboard"
                class="flex items-center hover:text-[color:var(--color-primary)]"
                @click="loginMenuVisible = false"
              >
                <VcIcon class="text-[--color-primary-500]" name="user-circle" />

                <span class="ml-2">{{ user.contact?.fullName }}</span>
              </router-link>

              <div class="grow"></div>

              <VcButton
                :title="$t('shared.layout.header.link_logout')"
                class="ml-4"
                variant="outline"
                color="neutral"
                size="xs"
                icon
                @click="() => signMeOut()"
              >
                <VcIcon name="logout" />
              </VcButton>
            </div>
          </div>
        </div>
      </template>

      <!-- Unauthorized menu items -->
      <template v-else>
        <TopHeaderLink to="/contacts">
          {{ $t("shared.layout.header.top_header.link_contact_us") }}
        </TopHeaderLink>

        <span class="mx-4 h-5 w-px bg-[color:var(--color-primary)]" />

        <TopHeaderLink to="/sign-in">
          {{ $t("shared.layout.header.link_sign_in") }}
        </TopHeaderLink>

        <span class="mx-3 size-1 rounded-full bg-[color:var(--color-primary)]" />

        <TopHeaderLink to="/sign-up">
          {{ $t("shared.layout.header.link_register_now") }}
        </TopHeaderLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { ref } from "vue";
import { useSignMeOut } from "@/shared/account/composables/useSignMeOut";
import { useUser } from "@/shared/account/composables/useUser";
import TopHeaderLink from "./top-header-link.vue";
import CurrencySelector from "@/shared/layout/components/currency-selector/currency-selector.vue";
import LanguageSelector from "@/shared/layout/components/language-selector/language-selector.vue";

const { isAuthenticated, user, operator } = useUser();
const { signMeOut } = useSignMeOut();

const loginMenu = ref(null);
const loginMenuVisible = ref(false);

onClickOutside(loginMenu, () => {
  loginMenuVisible.value = false;
});
</script>
