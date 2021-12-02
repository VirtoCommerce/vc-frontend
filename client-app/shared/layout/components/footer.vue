<template>
  <!-- Top footer -->
  <div class="hidden md:block bg-gray-800">
    <div class="container mx-auto grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5 p-12">
      <!-- Logo column -->
      <div class="hidden xl:block">
        <img src="/assets/static/images/logo_white.svg" class="h-9" />
      </div>

      <!-- Column 1 -->
      <div>
        <div class="uppercase font-extrabold text-base text-white mb-3">Company information</div>
        <div class="flex flex-col space-y-1">
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/about">About Us</router-link>
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/investor-relations"
            >Investor Relations</router-link
          >
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/supplier-overview"
            >Supplier Overview</router-link
          >
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/worldwide"
            >Worlwide</router-link
          >
        </div>
      </div>

      <!-- Column 2 -->
      <div>
        <div class="uppercase font-extrabold text-base text-white mb-3">Customer support</div>
        <div class="flex flex-col space-y-1">
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/catalog-request"
            >Catalog Request</router-link
          >
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/contact-us"
            >Contact Us</router-link
          >
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/feedback"
            >Feedback</router-link
          >
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/find-a-branch"
            >Find A Branch</router-link
          >
        </div>
      </div>

      <!-- Column 3 -->
      <div>
        <div class="uppercase font-extrabold text-base text-white mb-3">Order support</div>
        <div class="flex flex-col space-y-1">
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/orders">Orders</router-link>
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/pick-up">Pick-Up</router-link>
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/auto-reorder"
            >Auto-Reorder</router-link
          >
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/special-orders"
            >Special Orders</router-link
          >
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/returns"
            >Returns & Cancellations</router-link
          >
        </div>
      </div>

      <!-- Column 4 -->
      <div>
        <div class="uppercase font-extrabold text-base text-white mb-3">Online resources</div>
        <div class="flex flex-col space-y-1">
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/catalog">Catalog</router-link>
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/hot-buys"
            >Hot Buys</router-link
          >
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/rebates">Rebates</router-link>
          <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" to="/replacement-parts"
            >Replacement Parts</router-link
          >
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom footer -->
  <div
    class="bg-gray-900 flex flex-col md:flex-row items-center justify-between h-16 text-white text-xs px-4 md:px-12 py-3"
  >
    <div class="font-medium">© 2021 <span class="font-bold">VirtoCommerce</span>. All Rights Reserved.</div>
    <div>ASP.NET ecommerce platform <a class="text-blue-400 hover:text-blue-500 font-bold" href="#">by Virto</a></div>
  </div>
</template>
