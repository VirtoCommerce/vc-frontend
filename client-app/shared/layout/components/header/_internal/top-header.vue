<template>
  <div
    class="flex h-[39px] items-center gap-3 bg-[--header-top-bg-color] px-5 text-sm text-[--header-top-text-color] xl:gap-5 xl:px-12"
  >
    <LanguageSelector v-if="$context.availableLanguages && $context.availableLanguages.length > 1" />

    <CurrencySelector v-if="$context.availableCurrencies && $context.availableCurrencies.length > 1" class="h-full" />

    <ShipToSelector />

    <div class="ms-auto flex items-center">
      <!-- Call us block -->
      <div v-if="support_phone_number" class="flex items-center whitespace-nowrap">
        <VcIcon class="me-1.5 fill-primary" name="phone" size="sm" />

        <span class="mr-1 font-thin">
          {{ $t("shared.layout.header.top_header.call_us_label") }}
        </span>

        <a
          class="py-1 font-bold text-[--header-top-link-color] hover:text-[--header-top-link-hover-color]"
          :href="`tel:${support_phone_number}`"
        >
          {{ support_phone_number }}
        </a>

        <span class="mx-4 h-5 w-px bg-primary" />
      </div>

      <!-- Authorized menu items -->
      <template v-if="isAuthenticated">
        <TopHeaderLink to="/account/dashboard">
          {{ $t("shared.layout.header.top_header.link_dashboard") }}
        </TopHeaderLink>

        <span class="mx-2 size-1 rounded-full bg-primary" />

        <TopHeaderLink to="/contacts">
          {{ $t("shared.layout.header.top_header.link_contact_us") }}
        </TopHeaderLink>

        <span class="mx-4 h-5 w-px bg-primary" />

        <!-- Account menu -->
        <div ref="loginMenu" class="relative flex flex-row items-center gap-x-1">
          <!-- Operator -->
          <template v-if="operator">
            <span class="font-bold">{{ operator.contact?.fullName || operator.userName }}</span>
            <span class="text-neutral-400">
              {{ $t("shared.layout.header.top_header.logged_in_as") }}
            </span>
          </template>

          <button
            type="button"
            class="flex cursor-pointer items-center whitespace-nowrap py-1 text-[--header-top-text-color] hover:text-[--header-top-link-color]"
            @click="loginMenuVisible = !loginMenuVisible"
          >
            <span class="font-bold">
              <template v-if="isMultiOrganization">{{ organization?.name }} /</template>
              {{ user.contact?.fullName || user.userName }}
            </span>

            <VcIcon
              class="ms-1.5 fill-accent-200 [--vc-icon-size:1rem] lg:fill-primary lg:[--vc-icon-size:0.625rem]"
              :name="loginMenuVisible ? 'chevron-up' : 'chevron-down'"
            />
          </button>

          <div
            v-if="loginMenuVisible"
            class="absolute right-0 top-full z-10 flex w-60 flex-col rounded-md bg-additional-50 text-additional-950 shadow-md"
          >
            <div class="flex items-center justify-between p-3">
              <router-link
                to="/account/dashboard"
                class="flex items-center hover:text-primary"
                @click="loginMenuVisible = false"
              >
                <VcIcon class="fill-primary" name="user-circle" />

                <span class="ml-2">
                  {{ user.contact?.fullName }}
                </span>
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

            <div v-if="isMultiOrganization" class="border-t py-3">
              <div class="px-3 py-1 text-xs text-neutral-600">
                {{ $t("common.labels.organizations") }}
              </div>

              <VcRadioButton
                v-for="item in user.contact?.organizations?.items"
                :key="item.id"
                v-model="contactOrganizationId"
                :label="item.name"
                :value="item.id"
                class="flex px-3 py-1 text-sm"
                @change="selectOrganization"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Unauthorized menu items -->
      <template v-else>
        <TopHeaderLink to="/contacts">
          {{ $t("shared.layout.header.top_header.link_contact_us") }}
        </TopHeaderLink>

        <span class="mx-4 h-5 w-px bg-primary" />

        <TopHeaderLink to="/sign-in">
          {{ $t("shared.layout.header.link_sign_in") }}
        </TopHeaderLink>

        <span class="mx-3 size-1 rounded-full bg-primary" />

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
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { useSignMeOut, useUser } from "@/shared/account";
import { CurrencySelector, LanguageSelector } from "@/shared/layout/components";
import { ShipToSelector } from "@/shared/ship-to-location";
import TopHeaderLink from "./top-header-link.vue";

const { isAuthenticated, isMultiOrganization, user, operator, organization, switchOrganization } = useUser();
const { signMeOut } = useSignMeOut();
const { getSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

const loginMenu = ref(null);
const loginMenuVisible = ref(false);
const contactOrganizationId = ref(user.value?.contact?.organizationId);

const support_phone_number = getSettingValue(MODULE_XAPI_KEYS.SUPPORT_PHONE_NUMBER);

async function selectOrganization(): Promise<void> {
  if (!contactOrganizationId.value) {
    return;
  }

  await switchOrganization(contactOrganizationId.value);
  loginMenuVisible.value = false;
}

onClickOutside(loginMenu, () => {
  loginMenuVisible.value = false;
});
</script>
