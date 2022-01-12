<template>
  <Card title="My account">
    <div class="flex flex-col">
      <router-link to="/dashboard" class="flex items-center p-3 icon dashboard-icon">
        <div class="h-4 w-4"></div>
        <span class="ml-3 text-gray-500 font-extrabold text-sm">Dashboard</span>
      </router-link>
      <router-link to="/profile" class="flex items-center p-3 icon profile-icon">
        <div class="h-4 w-4"></div>
        <span class="ml-3 text-gray-500 font-extrabold text-sm">Profile</span>
      </router-link>
      <router-link to="/addresses" class="flex items-center p-3 icon addresses-icon">
        <div class="h-4 w-4"></div>
        <span class="ml-3 text-gray-500 font-extrabold text-sm">Addresses</span>
      </router-link>
      <router-link to="/changePassword" class="flex items-center p-3 icon password-icon">
        <div class="h-4 w-4"></div>
        <span class="ml-3 text-gray-500 font-extrabold text-sm">Change password</span>
      </router-link>
      <router-link to="/orders" class="flex items-center p-3 icon orders-icon">
        <div class="h-4 w-4"></div>
        <span class="ml-3 text-gray-500 font-extrabold text-sm">Orders</span>
      </router-link>
      <router-link to="/list" class="flex items-center p-3 icon list-icon">
        <div class="h-4 w-4"></div>
        <span class="ml-3 text-gray-500 font-extrabold text-sm">Your List</span>
      </router-link>
      <router-link to="/checkoutDefaults" class="flex items-center p-3 icon checkout-icon">
        <div class="h-4 w-4"></div>
        <span class="ml-3 text-gray-500 font-extrabold text-sm">Checkout Details</span>
      </router-link>
    </div>
  </Card>
  <Card title="Corporate">
    <div class="flex flex-col">
      <router-link to="/companyInfo" class="flex items-center p-3 icon company-icon">
        <div class="h-4 w-4"></div>
        <span class="ml-3 text-gray-500 font-extrabold text-sm">Company info</span>
      </router-link>
      <router-link to="/companyMembers" class="flex items-center p-3 icon company-members-icon">
        <div class="h-4 w-4"></div>
        <span class="ml-3 text-gray-500 font-extrabold text-sm">Company members</span>
      </router-link>
    </div>
  </Card>
</template>
<script setup lang="ts">
import { Card } from "@/components";
</script>
<style>
/* Icons */
.icon > div {
  background-color: #808080;
}
.dashboard-icon > div {
  mask: url(/assets/static/images/dashboard/icons/grid.svg) no-repeat center / contain;
  -webkit-mask: url(/assets/static/images/dashboard/icons/grid.svg) no-repeat center / contain;
}
.profile-icon > div {
  mask: url(/assets/static/images/dashboard/icons/profile.svg) no-repeat center / contain;
  -webkit-mask: url(/assets/static/images/dashboard/icons/profile.svg) no-repeat center / contain;
}
.addresses-icon > div {
  mask: url(/assets/static/images/dashboard/icons/building.svg) no-repeat center / contain;
  -webkit-mask: url(/assets/static/images/dashboard/icons/building.svg) no-repeat center / contain;
}
.password-icon > div {
  mask: url(/assets/static/images/dashboard/icons/password.svg) no-repeat center / contain;
  -webkit-mask: url(/assets/static/images/dashboard/icons/password.svg) no-repeat center / contain;
}
.orders-icon > div {
  mask: url(/assets/static/images/dashboard/icons/orders.svg) no-repeat center / contain;
  -webkit-mask: url(/assets/static/images/dashboard/icons/orders.svg) no-repeat center / contain;
}
.list-icon > div {
  mask: url(/assets/static/images/dashboard/icons/list.svg) no-repeat center / contain;
  -webkit-mask: url(/assets/static/images/dashboard/icons/list.svg) no-repeat center / contain;
}
.checkout-icon > div {
  mask: url(/assets/static/images/dashboard/icons/cart.svg) no-repeat center / contain;
  -webkit-mask: url(/assets/static/images/dashboard/icons/cart.svg) no-repeat center / contain;
}
.company-icon > div {
  mask: url(/assets/static/images/dashboard/icons/company.svg) no-repeat center / contain;
  -webkit-mask: url(/assets/static/images/dashboard/icons/company.svg) no-repeat center / contain;
}
.company-members-icon > div {
  mask: url(/assets/static/images/dashboard/icons/members.svg) no-repeat center / contain;
  -webkit-mask: url(/assets/static/images/dashboard/icons/members.svg) no-repeat center / contain;
}

/* Active/hover state styles */
.router-link-active > div,
.icon:hover > div {
  background-color: orange;
}
.icon:hover span {
  color: #4b5563;
}
.router-link-active.icon {
  background-color: #f9f9f9;
  border-radius: 3px;
}
.router-link-active span {
  color: #1f222c;
}
</style>
