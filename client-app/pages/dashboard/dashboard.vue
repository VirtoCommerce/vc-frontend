<template>
  <div class="bg-gray-100 pt-6 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <h2 class="md:hidden text-gray-800 px-5 text-3xl font-bold uppercase mb-5">Dashboard</h2>
      <div class="flex">
        <!-- First column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <Card title="My account">
            <div class="flex flex-col">
              <router-link to="/dashboard" class="flex items-center p-3 icon dashboard-icon">
                <div class="h-3.5 w-3.5"></div>
                <span class="ml-3 text-gray-500 font-extrabold text-sm">Dashboard</span>
              </router-link>
              <router-link to="/profile" class="flex items-center p-3 icon profile-icon">
                <div class="h-3.5 w-3.5"></div>
                <span class="ml-3 text-gray-500 font-extrabold text-sm">Profile</span>
              </router-link>
              <router-link to="/addresses" class="flex items-center p-3 icon addresses-icon">
                <div class="h-3.5 w-3.5"></div>
                <span class="ml-3 text-gray-500 font-extrabold text-sm">Addresses</span>
              </router-link>
              <router-link to="/changePassword" class="flex items-center p-3 icon password-icon">
                <div class="h-3.5 w-3.5"></div>
                <span class="ml-3 text-gray-500 font-extrabold text-sm">Change password</span>
              </router-link>
              <router-link to="/orders" class="flex items-center p-3 icon orders-icon">
                <div class="h-3.5 w-3.5"></div>
                <span class="ml-3 text-gray-500 font-extrabold text-sm">Orders</span>
              </router-link>
              <router-link to="/list" class="flex items-center p-3 icon list-icon">
                <div class="h-3.5 w-3.5"></div>
                <span class="ml-3 text-gray-500 font-extrabold text-sm">Your List</span>
              </router-link>
              <router-link to="/checkoutDefaults" class="flex items-center p-3 icon checkout-icon">
                <div class="h-3.5 w-3.5"></div>
                <span class="ml-3 text-gray-500 font-extrabold text-sm">Checkout Details</span>
              </router-link>
            </div>
          </Card>
          <Card title="Corporate">
            <div class="flex flex-col">
              <router-link to="/companyInfo" class="flex items-center p-3 icon company-icon">
                <div class="h-3.5 w-3.5"></div>
                <span class="ml-3 text-gray-500 font-extrabold text-sm">Company info</span>
              </router-link>
              <router-link to="/companyMembers" class="flex items-center p-3 icon company-members-icon">
                <div class="h-3.5 w-3.5"></div>
                <span class="ml-3 text-gray-500 font-extrabold text-sm">Company members</span>
              </router-link>
            </div>
          </Card>
        </div>
        <!-- Second column-->
        <div class="flex flex-col w-full px-5 space-y-5 lg:w-3/5">
          <Card title="Last orders" class="h-52"></Card>
          <div class="flex flex-col space-y-5 lg:flex-row lg:space-x-5 lg:space-y-0">
            <Card title="Monthly spend report" class="h-52">
              <div class="flex content-center space-x-9">
                <img src="/assets/static/images/dashboard/spend-chart.svg" alt="Spend chart" />
                <div
                  class="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:flex-wrap sm:space-x-5 sm:items-center xl:space-x-7 justify-center"
                >
                  <div class="flex flex-col lg:items-center lg:space-y-3">
                    <span class="text-xs text-gray-400 lg:text-gray-600 lg:font-bold">Budget</span>
                    <span class="text-2xl font-extrabold">$58,152</span>
                  </div>
                  <div class="flex flex-col lg:items-center lg:space-y-3">
                    <span class="text-xs text-gray-400 lg:text-gray-600 lg:font-bold">Total spend</span>
                    <span class="text-2xl font-extrabold">$530,152</span>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="Orders status" class="h-52 lg:flex-1"></Card>
          </div>
          <Card title="Users" class="h-52"></Card>
          <Card title="Current user roles" class="h-36"></Card>
        </div>
        <!-- Third column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <Card title="Bulk order pad" class="h-96"></Card>
          <Card title="Current user roles" class="h-80"></Card>
        </div>
      </div>
    </div>
  </div>
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
