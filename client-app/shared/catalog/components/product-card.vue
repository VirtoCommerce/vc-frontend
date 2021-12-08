<template>
  <div class="bg-white rounded p-4 shadow-md hover:shadow-xl cursor-pointer">
    <a href="#" class="flex flex-col justify-center items-center border border-gray-100">
      <img src="/assets/static/images/test-pc.png" alt="Test PC" class="w-full h-full object-cover object-center" />
    </a>
    <div class="flex flex-col pt-4">
      <label class="hidden md:inline-flex items-center text-sm pb-3">
        <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
        <span class="ml-2">Compare</span>
      </label>
      <router-link to="/" class="text-cyan-700 font-extrabold text-sm pb-3">Techpower Cortex ET-2550</router-link>
      <div class="hidden md:flex gap-6 text-sm pb-2">
        <div class="flex flex-col">
          <span>Item #</span>
          <span>Mfr. model #</span>
        </div>
        <div class="flex flex-col">
          <span class="text-cyan-700">4498896</span>
          <span class="text-cyan-700">33-4994</span>
        </div>
      </div>
      <div class="flex flex-col md:flex-row md:gap-10 text-sm pb-3">
        <span>Your price</span>
        <p><span class="text-green-900 font-extrabold">$1899.00</span> / each</p>
      </div>
      <div class="flex">
        <input type="text" class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 p-2.5" />
        <button class="rounded-r uppercase px-3 border border-yellow-500 text-yellow-500 text-roboto font-bold text-sm">
          Add to cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
