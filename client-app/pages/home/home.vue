<template>
  <!-- Banner -->
  <div class="banner flex items-center">
    <div class="container mx-auto flex flex-col md:flex-row items-center space-y-10 md:space-x-24 p-6 md:p-12">
      <div v-if="!isAuthenticated" class="w-full md:w-2/5 bg-white shadow-lg rounded p-10">Login form</div>
      <div
        class="w-full md:w-3/5 text-white font-bold filter drop-shadow-lg text-center md:text-left text-3xl md:text-5xl select-none"
      >
        <div class="uppercase mb-10 leading-snug">We can help you<br />to make the right<br />and wise decisions</div>
        <div class="flex flex-col md:flex-row items-center space-y-2 md:space-x-7 text-xl md:text-2xl">
          <div>Result oriented</div>
          <div class="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
          <div>Trustworthy</div>
          <div class="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
          <div>Reliable</div>
        </div>
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div class="py-6 lg:py-10 bg-yellow-500">
    <div class="container mx-auto flex flex-col lg:flex-row items-center space-y-2 lg:space-x-10 px-6 md:px-12">
      <div class="uppercase font-bold text-3xl text-white whitespace-nowrap">subscribe now!</div>
      <div class="text-base leading-tight text-white max-w-max lg:max-w-min">
        Your&nbsp;connection&nbsp;to&nbsp;what's new&nbsp;at&nbsp;B2B-store.
      </div>
      <div class="flex flex-grow w-full space-x-6">
        <input class="bg-white rounded h-11 flex-grow shadow-md px-4 min-w-0" placeholder="Enter E-mail" />
        <button class="bg-gray-100 hover:bg-gray-200 px-6 uppercase text-sm font-bold h-11 rounded shadow-md">
          Subscribe
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useUser from "@/shared/account/composables/useUser";
const { isAuthenticated, me } = useUser();
</script>

<style scoped>
.banner {
  position: relative;
  background: url(/assets/static/images/main-banner.jpeg) center center no-repeat;
  background-size: cover;
  min-height: 549px;
}
</style>
