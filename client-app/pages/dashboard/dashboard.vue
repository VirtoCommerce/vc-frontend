<template>
  <div class="bg-gray-100 pt-6 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <h2 class="md:hidden text-gray-800 px-5 text-3xl font-bold uppercase mb-5">Dashboard</h2>
      <div class="flex">
        <!-- First column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <AccountNavigation></AccountNavigation>
        </div>
        <!-- Second column-->
        <div class="flex flex-col w-full px-5 space-y-5 lg:w-3/5">
          <Card title="Last orders" class="h-52"></Card>
          <div class="flex flex-col space-y-5 lg:flex-row lg:space-x-5 lg:space-y-0">
            <Card title="Monthly spend report" class="lg:w-1/2">
              <div class="flex content-center space-x-9 lg:space-x-4">
                <img src="/assets/static/images/dashboard/spend-chart.svg" class="h-24 w-24" alt="Spend chart" />
                <div
                  class="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:flex-wrap sm:space-x-5 sm:items-center xl:space-x-7 justify-center"
                >
                  <div class="flex flex-col lg:items-center lg:space-y-3">
                    <span class="text-xs text-gray-400 lg:text-gray-600 lg:font-bold">Budget</span>
                    <span class="text-xl font-extrabold">$58,152</span>
                  </div>
                  <div class="flex flex-col lg:items-center lg:space-y-3">
                    <span class="text-xs text-gray-400 lg:text-gray-600 lg:font-bold">Total spend</span>
                    <span class="text-xl font-extrabold">$530,152</span>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="Orders status" class="h-52 lg:h-auto lg:w-1/2"></Card>
          </div>
          <Card title="Users" class="h-52"></Card>
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
import { AccountNavigation } from "@/shared/account";
</script>
