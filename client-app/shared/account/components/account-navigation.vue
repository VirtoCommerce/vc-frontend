<template>
  <VcCard title="My account">
    <div class="flex flex-col">
      <AccountNavigationLink
        to="/account/dashboard"
        :text="$t('shared.account.navigation.dashboard')"
        class="dashboard-icon"
      ></AccountNavigationLink>
      <AccountNavigationLink
        to="/account/profile"
        :text="$t('shared.account.navigation.profile')"
        class="profile-icon"
      ></AccountNavigationLink>
      <AccountNavigationLink
        to="/account/addresses"
        :text="$t('shared.account.navigation.addresses')"
        class="addresses-icon"
      ></AccountNavigationLink>
      <AccountNavigationLink
        to="/account/orders"
        :text="$t('shared.account.navigation.orders')"
        class="orders-icon"
      ></AccountNavigationLink>
      <AccountNavigationLink
        to="/list"
        :text="$t('shared.account.navigation.your_list')"
        class="list-icon"
      ></AccountNavigationLink>
      <AccountNavigationLink
        to="/account/checkout-defaults"
        :text="$t('shared.account.navigation.checkout_defaults')"
        class="checkout-icon"
      ></AccountNavigationLink>
    </div>
  </VcCard>
  <!-- Commented due to accetpance criteria, will be used in future-->
  <!-- <VcCard title="Corporate">
    <div class="flex flex-col">
      <AccountNavigationLink to="/companyInfo" text="Company info" class="company-icon"></AccountNavigationLink>
      <AccountNavigationLink
        to="/companyMembers"
        text="Company members"
        class="company-members-icon"
      ></AccountNavigationLink>
    </div>
  </VcCard> -->
</template>

<script setup lang="ts">
import { VcCard } from "@/components";
import { AccountNavigationLink } from ".";
</script>
