<template>
  <div class="header hidden lg:block">
    <!-- Top header -->
    <div class="h-12 px-12 flex items-center justify-end bg-gray-900 font-bold text-xs text-white">
      <div class="flex items-center">
        <router-link class="text-blue-400 hover:text-blue-500" to="/login">Sign In</router-link>
        <div class="mx-3 h-1 w-1 bg-yellow-500 rounded"></div>
        <router-link class="text-blue-400 hover:text-blue-500" to="/register">Register now</router-link>
      </div>
    </div>

    <!-- Bottom header-->
    <div class="px-12 py-7 flex items-center justify-between bg-white">
      <img src="/assets/static/images/logo.svg" class="h-12" />
      <div class="w-0.5 h-6 bg-yellow-500 mx-5 hidden xl:block"></div>
      <div class="italic text-lg text-gray-900 hidden xl:block">Construction goods</div>
      <div class="flex-grow"></div>
      <div class="flex items-center space-x-8">
        <router-link to="/" class="uppercase font-bold text-gray-500">Home</router-link>
        <div class="uppercase font-bold text-gray-500">All products</div>
        <div class="uppercase font-bold text-gray-500">Bulk order pad</div>
        <router-link to="/checkout" class="uppercase font-bold text-gray-500">Cart</router-link>
        <router-link to="/contact" class="uppercase font-bold text-gray-500">Contact Us</router-link>
      </div>
    </div>
  </div>
</template>

<style>
.header .router-link-active {
  position: relative;
}

.header .router-link-active:after {
  content: "";
  height: 3px;
  background-color: #ffbe2e;
  position: absolute;
  width: 100%;
  margin-top: 5px;
  display: block;
}
</style>
