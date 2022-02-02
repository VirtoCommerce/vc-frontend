<template>
  <Card title="My account">
    <div class="flex flex-col">
      <AccountNavigationLink to="/account/dashboard" text="Dashboard" class="dashboard-icon"></AccountNavigationLink>
      <AccountNavigationLink to="/profile" text="Profile" class="profile-icon"></AccountNavigationLink>
      <AccountNavigationLink to="/account/addresses" text="Addresses" class="addresses-icon"></AccountNavigationLink>
      <AccountNavigationLink to="/orders" text="Orders" class="orders-icon"></AccountNavigationLink>
      <AccountNavigationLink to="/list" text="Your List" class="list-icon"></AccountNavigationLink>
      <AccountNavigationLink
        to="/account/checkout-defaults"
        text="Checkout Defaults"
        class="checkout-icon"
      ></AccountNavigationLink>
    </div>
  </Card>
  <!-- Commented due to accetpance criteria, will be used in future-->
  <!-- <Card title="Corporate">
    <div class="flex flex-col">
      <AccountNavigationLink to="/companyInfo" text="Company info" class="company-icon"></AccountNavigationLink>
      <AccountNavigationLink
        to="/companyMembers"
        text="Company members"
        class="company-members-icon"
      ></AccountNavigationLink>
    </div>
  </Card> -->
</template>

<script setup lang="ts">
import { Card } from "@/components";
import { AccountNavigationLink } from ".";
</script>
