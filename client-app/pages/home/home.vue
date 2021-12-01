<template>
  <!-- Banner -->
  <div class="banner flex items-center">
    <div class="container mx-auto flex items-center space-x-24">
      <div v-if="!isAuthenticated" class="w-2/5 bg-white shadow-lg rounded p-10">Login form</div>
      <div class="w-3/5 text-white font-bold filter drop-shadow-lg text-5xl leading-snug">
        <div class="uppercase mb-10">We can help you<br />to make the right<br />and wise decisions</div>
        <div class="flex items-center space-x-7 text-2xl">
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
  <div class="py-10 bg-yellow-500">
    <div class="container mx-auto flex items-center space-x-6">
      <div class="uppercase font-bold text-3xl text-white">subscribe now!</div>
      <div class="text-base leading-tight text-white">Your connection to what's<br />new at B2B-store.</div>
      <input class="bg-white rounded h-11 flex-grow shadow-md px-4" placeholder="Enter E-mail" />
      <button class="bg-gray-100 hover:bg-gray-200 px-6 uppercase text-sm font-bold h-11 rounded shadow-md">
        Subscribe
      </button>
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
