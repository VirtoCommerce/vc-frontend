<template>
  <div class="rounded border bg-white shadow-md-s">
    <div class="border-b px-4 py-2.5 text-base font-bold uppercase">
      {{ $t("shared.account.navigation.main_title") }}
    </div>
    <div class="flex flex-col gap-0.5 px-4 py-3">
      <AccountNavigationLink
        :to="{ name: 'Dashboard' }"
        :text="$t('shared.account.navigation.links.dashboard')"
        class="dashboard-icon"
      />

      <AccountNavigationLink
        :to="{ name: 'Profile' }"
        :text="$t('shared.account.navigation.links.profile')"
        class="profile-icon"
      />

      <AccountNavigationLink
        v-if="!isCorporateMember"
        :to="{ name: 'Addresses' }"
        :text="$t('shared.account.navigation.links.addresses')"
        class="addresses-icon"
      />

      <AccountNavigationLink
        :to="{ name: 'Orders' }"
        :text="$t('shared.account.navigation.links.orders')"
        class="orders-icon"
      />

      <AccountNavigationLink
        :to="{ name: 'Lists' }"
        :text="$t('shared.account.navigation.links.lists')"
        class="list-icon pb-2"
      />

      <template v-if="isListDetails">
        <div v-for="list in lists" :key="list.id" class="ml-8 flex items-center space-x-2 px-3 text-sm">
          <VcIcon class="flex-none text-[--color-primary-500]" name="minus" />

          <router-link
            :to="{ name: 'ListDetails', params: { listId: list.id } }"
            class="cursor-pointer py-0.5 font-semibold text-gray-500 hover:text-black"
            active-class="text-black"
          >
            {{ list.name }}
          </router-link>
        </div>
      </template>

      <AccountNavigationLink
        :to="{ name: 'CheckoutDefaults' }"
        :text="$t('shared.account.navigation.links.checkout_defaults')"
        class="checkout-icon"
      />

      <AccountNavigationLink
        v-if="$cfg.quotes_enabled"
        :to="{ name: 'Quotes' }"
        :text="$t('shared.account.navigation.links.quote_requests')"
        class="quotes-icon"
      />
    </div>
  </div>

  <div v-if="isCorporateMember" class="rounded border bg-white shadow-md-s">
    <div class="border-b px-4 py-2.5 text-base font-bold uppercase">
      {{ $t("shared.account.navigation.corporate_title") }}
    </div>
    <div class="flex flex-col gap-0.5 px-4 py-3">
      <AccountNavigationLink
        :to="{ name: 'CompanyInfo' }"
        :text="$t('shared.account.navigation.links.company_info')"
        class="company-icon"
      />

      <AccountNavigationLink
        :to="{ name: 'CompanyMembers' }"
        :text="$t('shared.account.navigation.links.company_members')"
        class="company-members-icon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { eagerComputed } from "@vueuse/core";
import { watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useWishlists } from "@/shared/wishlists";
import { useUser } from "../composables/useUser";
import AccountNavigationLink from "./account-navigation-link.vue";

const route = useRoute();
const { isCorporateMember } = useUser();
const { lists, fetchWishlists } = useWishlists();

const isListDetails = eagerComputed(() => route.name === "ListDetails");

watchEffect(() => {
  if (isListDetails.value) {
    fetchWishlists();
  }
});
</script>
