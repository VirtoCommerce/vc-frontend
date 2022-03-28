<template>
  <VcCard title="My account">
    <div class="flex flex-col">
      <AccountNavigationLink to="/account/dashboard" text="Dashboard" class="dashboard-icon"></AccountNavigationLink>
      <AccountNavigationLink to="/account/profile" text="Profile" class="profile-icon"></AccountNavigationLink>
      <AccountNavigationLink to="/account/addresses" text="Addresses" class="addresses-icon"></AccountNavigationLink>
      <AccountNavigationLink to="/account/orders" text="Orders" class="orders-icon"></AccountNavigationLink>
      <AccountNavigationLink to="/list" text="Your List" class="list-icon"></AccountNavigationLink>
      <AccountNavigationLink
        to="/account/checkout-defaults"
        text="Checkout Defaults"
        class="checkout-icon"
      ></AccountNavigationLink>
      <AccountNavigationLink to="/account/loyalty" text="Loyalty" class="dashboard-icon"></AccountNavigationLink>
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
