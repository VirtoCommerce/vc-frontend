<template>
  <div class="flex items-center justify-between bg-white rounded border p-4 shadow-sm space-x-6">
    <div class="flex flex-grow items-center">
      <!-- Product image -->
      <div class="border border-gray-100 bg-gray-100 w-20 h-20 mr-4"></div>

      <div class="flex-grow">
        <!-- Product title -->
        <div class="bg-gray-100 mb-1 h-4"></div>
        <div class="w-2/5 mb-3 bg-gray-100 h-4"></div>

        <!-- Compare checkbox -->
        <div class="w-24 bg-gray-100 h-4"></div>
      </div>
    </div>

    <!-- Product props -->
    <div class="flex-shrink-0 w-20">
      <div class="bg-gray-100 h-3 w-3/5 mb-1"></div>
      <div class="bg-gray-100 h-4"></div>
    </div>

    <div class="flex-shrink-0 w-24">
      <div class="bg-gray-100 h-3 w-3/5 mb-1"></div>
      <div class="bg-gray-100 h-4"></div>
    </div>

    <!-- Product price -->
    <div class="flex-shrink-0 w-28">
      <div class="bg-gray-100 h-3 w-3/5 mb-1"></div>
      <div class="bg-gray-100 h-4 w-4/5"></div>
    </div>

    <!-- Card widget -->
    <div class="flex-shrink-0 w-48">
      <div class="flex mb-3">
        <div class="border border-r-0 flex-1 w-full border-gray-100 h-9"></div>
        <div class="bg-gray-100 w-2/5"></div>
      </div>
      <div class="w-2/5 h-4 bg-gray-100"></div>
    </div>
  </div>
</template>
