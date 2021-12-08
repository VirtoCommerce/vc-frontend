<template>
  <div class="bg-white rounded p-4 shadow-md hover:shadow-xl cursor-pointer">
    <!-- Product image -->
    <a href="#" class="flex flex-col justify-center items-center border border-gray-100">
      <img src="/assets/static/images/test-pc.png" alt="Test PC" class="w-full h-full object-cover object-center" />
    </a>

    <div class="flex flex-col pt-4">
      <!-- Compare checkbox -->
      <label class="hidden md:inline-flex items-center text-sm pb-3 cursor-pointer">
        <input
          type="checkbox"
          class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-cyan-700 checked:border-transparent focus:outline-none cursor-pointer"
        />
        <span class="ml-2">Compare</span>
      </label>

      <!-- Product title -->
      <router-link to="/" class="text-cyan-700 font-extrabold text-sm pb-3">Techpower Cortex ET-2550</router-link>

      <!-- Product props -->
      <div class="hidden md:block text-sm pb-2">
        <div class="flex items-baseline">
          <div class="w-1/2 font-bold text-xs">Item #</div>
          <span class="w-1/2 text-cyan-700">4498896</span>
        </div>
        <div class="flex items-baseline">
          <div class="w-1/2 font-bold text-xs">Mfr. model #</div>
          <span class="w-1/2 text-cyan-700">33-4994</span>
        </div>
      </div>

      <!-- Product price -->
      <div class="flex items-baseline text-sm mb-4">
        <div class="w-1/2 font-bold text-xs">Your price</div>
        <div class="w-1/2"><span class="text-green-700 font-extrabold">$1&nbsp;899.00</span> / each</div>
      </div>

      <!-- Card widget -->
      <div class="flex">
        <input
          type="text"
          class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 focus:border-gray-400 h-9 outline-none px-3 leading-9"
        />
        <button
          class="rounded-r uppercase px-3 border border-yellow-500 text-yellow-500 font-roboto-condensed font-bold text-sm hover:text-white hover:bg-yellow-500"
        >
          Add to cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
