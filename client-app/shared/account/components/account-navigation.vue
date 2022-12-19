<template>
  <div class="bg-white border rounded shadow-md-s">
    <div class="px-4 py-2.5 border-b text-base font-bold uppercase">
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
        <div class="px-3 ml-8 flex text-sm items-center space-x-2" v-for="list in lists" :key="list.id">
          <i class="fas fa-minus text-[color:var(--color-primary)]" />

          <router-link
            :to="{ name: 'ListDetails', params: { listId: list.id } }"
            class="text-gray-500 font-semibold hover:text-black cursor-pointer py-0.5"
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
        :to="{ name: 'Quotes' }"
        :text="$t('shared.account.navigation.links.quote_requests')"
        class="quotes-icon"
        v-if="$cfg.quotes_enabled"
      />
    </div>
  </div>

  <div v-if="organization" class="bg-white border rounded shadow-md-s">
    <div class="px-4 py-2.5 border-b text-base font-bold uppercase">
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
import { AccountNavigationLink } from ".";
import { watchEffect } from "vue";
import { useRoute } from "vue-router";
import { eagerComputed } from "@vueuse/core";
import { useWishlists } from "@/shared/wishlists";
import { useUser } from "@/shared/account";

const route = useRoute();
const { organization } = useUser();
const { lists, fetchWishlists } = useWishlists();

const isListDetails = eagerComputed(() => route.name === "ListDetails");

watchEffect(() => {
  if (isListDetails.value) {
    fetchWishlists();
  }
});
</script>
