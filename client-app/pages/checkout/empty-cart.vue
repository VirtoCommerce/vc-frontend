<template>
  <div class="polygon-bg flex-grow">
    <div class="mx-auto w-4/5 lg:w-3/5 pt-5 md:pb-32">
      <div class="flex justify-between md:gap-16">
        <div class="flex flex-col py-12 justify-center">
          <h2 class="text-black-800 text-2xl md:text-4xl font-bold mb-8">Your cart is empty</h2>
          <router-link
            to="/catalog"
            tag="button"
            class="bg-yellow-500 hover:bg-yellow-600 w-48 uppercase font-bold text-center rounded text-white py-3 text-base whitespace-nowrap font-roboto"
            >Continue shopping</router-link
          >
        </div>
        <div class="hidden md:block py-5">
          <img src="/assets/static/images/emptyCart.png" alt="Page not found" class="w-full max-w-md" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
