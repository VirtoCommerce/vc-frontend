<template>
  <header
    class="flex h-10 items-center gap-1 bg-[--header-top-bg-color] px-5 text-sm text-[--header-top-text-color] xl:gap-3 xl:px-11"
    data-test-id="main-layout.top-header"
  >
    <div class="flex min-w-0 shrink items-center gap-3">
      <LanguageSelector
        v-if="$context.availableLanguages && $context.availableLanguages.length > 1"
        class="flex-none"
      />

      <CurrencySelector
        v-if="$context.availableCurrencies && $context.availableCurrencies.length > 1"
        class="h-full flex-none"
      />

      <ShipToSelector />
    </div>

    <div class="ms-auto flex min-w-0 shrink-0 items-center">
      <!-- Call us block -->
      <div v-if="support_phone_number" class="flex items-center whitespace-nowrap">
        <VcIcon class="me-1.5 fill-primary" name="phone" size="sm" />

        <span class="font-thin">
          {{ $t("shared.layout.header.top_header.call_us_label") }}
        </span>

        <a
          class="p-1 font-bold text-[--header-top-link-color] hover:text-[--header-top-link-hover-color]"
          data-test-id="support-phone-number-link"
          :href="`tel:${support_phone_number}`"
          tabindex="0"
        >
          {{ support_phone_number }}
        </a>

        <span class="mx-3 h-5 w-px bg-primary" />
      </div>

      <!-- Authorized menu items -->
      <template v-if="isAuthenticated">
        <TopHeaderLink to="/account/dashboard" data-test-id="main-layout.top-header.dashboard-link">
          {{ $t("shared.layout.header.top_header.link_dashboard") }}
        </TopHeaderLink>

        <span class="mx-2 size-1 rounded-full bg-primary" />

        <TopHeaderLink to="/contacts" data-test-id="main-layout.top-header.contacts-link">
          {{ $t("shared.layout.header.top_header.link_contact_us") }}
        </TopHeaderLink>

        <span class="mx-3 h-5 w-px bg-primary" />

        <!-- Account menu -->
        <div ref="loginMenu" class="relative flex flex-row items-center gap-x-1">
          <!-- Operator -->
          <template v-if="operator">
            <span class="font-bold" data-test-id="main-layout.top-header.operator-name-label">
              {{ operator.contact?.fullName || operator.userName }}
            </span>

            <span class="text-neutral-400">
              {{ $t("shared.layout.header.top_header.logged_in_as") }}
            </span>
          </template>

          <button
            type="button"
            :aria-label="$t('shared.layout.header.top_header.account_menu_label')"
            aria-haspopup="true"
            :aria-expanded="loginMenuVisible"
            class="flex w-full cursor-pointer items-center whitespace-nowrap p-1 text-[--header-top-text-color] hover:text-[--header-top-link-color]"
            data-test-id="main-layout.top-header.account-menu-button"
            @click="loginMenuVisible = !loginMenuVisible"
          >
            <span class="hidden min-w-0 font-bold xl:inline">
              <template v-if="isMultiOrganization">
                <span
                  data-test-id="main-layout.top-header.organization-name-label"
                  class="min-w-0 truncate xl:max-w-80"
                  :title="organization?.name"
                  >{{ organization?.name }}</span
                >
                /
              </template>

              <span
                data-test-id="main-layout.top-header.customer-name-label"
                class="min-w-0 shrink-0 truncate xl:max-w-80"
                :title="user.contact?.fullName || user.userName"
                >{{ user.contact?.fullName || user.userName }}</span
              >
            </span>

            <VcIcon class="fill-primary xl:hidden" name="user-circle" size="sm" />

            <VcIcon
              class="ms-1.5 shrink-0 fill-accent-200 [--vc-icon-size:1rem] lg:fill-primary lg:[--vc-icon-size:0.625rem]"
              :name="loginMenuVisible ? 'chevron-up' : 'chevron-down'"
            />
          </button>

          <div
            v-if="loginMenuVisible"
            class="absolute right-0 top-full z-10 flex w-64 flex-col rounded-md bg-additional-50 text-additional-950 shadow-md"
            data-test-id="main-layout.top-header.account-menu"
          >
            <div class="flex max-w-full items-center justify-between p-3">
              <router-link
                to="/account/dashboard"
                class="flex min-w-0 items-center gap-2 hover:text-primary"
                data-test-id="main-layout.top-header.account-menu.dashboard-link"
                @click="loginMenuVisible = false"
              >
                <VcIcon class="fill-primary" name="user-circle" />

                <span class="truncate">
                  {{ user.contact?.fullName }}
                </span>
              </router-link>

              <VcButton
                :title="$t('shared.layout.header.link_logout')"
                class="ml-4"
                variant="outline"
                color="neutral"
                size="xs"
                data-test-id="main-layout.top-header.account-menu.sign-out-button"
                icon
                @click="signMeOut"
              >
                <VcIcon name="logout" />
              </VcButton>
            </div>

            <TopHeaderOrganizations v-if="isMultiOrganization" @organization-selected="loginMenuVisible = false" />
          </div>
        </div>
      </template>

      <!-- Unauthorized menu items -->
      <template v-else>
        <TopHeaderLink to="/contacts" data-test-id="contact-us-link">
          {{ $t("shared.layout.header.top_header.link_contact_us") }}
        </TopHeaderLink>

        <span class="mx-4 h-5 w-px bg-primary" />

        <TopHeaderLink :to="ROUTES.SIGN_IN.PATH" data-test-id="sign-in-link">
          {{ $t("shared.layout.header.link_sign_in") }}
        </TopHeaderLink>

        <span class="mx-3 size-1 rounded-full bg-primary" />

        <TopHeaderLink to="/sign-up" data-test-id="sign-up-link">
          {{ $t("shared.layout.header.link_register_now") }}
        </TopHeaderLink>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { ref } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { ROUTES } from "@/router/routes/constants";
import { useSignMeOut, useUser } from "@/shared/account";
import { CurrencySelector, LanguageSelector } from "@/shared/layout/components";
import { ShipToSelector } from "@/shared/ship-to-location";
import TopHeaderLink from "./top-header-link.vue";
import TopHeaderOrganizations from "./top-header-organizations.vue";

const { isAuthenticated, user, operator, organization, isMultiOrganization } = useUser();
const { signMeOut } = useSignMeOut();
const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

const loginMenu = ref(null);
const loginMenuVisible = ref(false);

const support_phone_number = getSettingValue(MODULE_XAPI_KEYS.SUPPORT_PHONE_NUMBER);

onClickOutside(loginMenu, () => {
  loginMenuVisible.value = false;
});
</script>
