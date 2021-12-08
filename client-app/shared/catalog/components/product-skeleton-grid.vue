<template>
  <div class="flex flex-col bg-white rounded p-4 shadow-md">
    <!-- Product image -->
    <div class="square flex border border-gray-100 bg-gray-100"></div>

    <div class="flex flex-col flex-grow pt-4">
      <div class="flex items-center justify-between mb-4">
        <div class="w-2/5 h-4 bg-gray-200"></div>

        <div class="w-2/5 h-4 bg-gray-100"></div>
      </div>

      <!-- Product title -->
      <div class="mb-4 flex-grow">
        <div class="w-full h-4 bg-gray-200 mb-1"></div>
        <div class="w-full h-4 bg-gray-200 mb-1"></div>
        <div class="w-3/5 h-4 bg-gray-200"></div>
      </div>

      <!-- Product props -->
      <div class="hidden md:block text-sm mb-3">
        <div class="flex items-baseline mb-1">
          <div class="w-1/2">
            <div class="w-2/5 h-4 bg-gray-200"></div>
          </div>
          <div class="w-1/2">
            <div class="w-2/5 h-4 bg-gray-100"></div>
          </div>
        </div>
        <div class="flex items-baseline">
          <div class="w-1/2">
            <div class="w-3/5 h-4 bg-gray-200"></div>
          </div>
          <div class="w-1/2">
            <div class="w-4/5 h-4 bg-gray-100"></div>
          </div>
        </div>
      </div>

      <!-- Product price -->
      <div class="flex items-baseline mb-4">
        <div class="w-1/2">
          <div class="w-2/5 h-4 bg-gray-200"></div>
        </div>
        <div class="w-1/2">
          <div class="w-4/5 h-4 bg-gray-100"></div>
        </div>
      </div>

      <!-- Card widget -->
      <div class="flex">
        <div class="border border-r-0 flex-1 w-full border-gray-100 h-9"></div>
        <div class="bg-gray-100 w-2/5"></div>
      </div>
    </div>
  </div>
</template>
