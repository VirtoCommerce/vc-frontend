<template>
  <div class="flex items-center gap-x-8 pb-5 py-3 px-6">
    <!-- Name and image -->
    <div class="flex flex-grow items-center">
      <!-- Product image -->
      <div class="border border-gray-100 bg-gray-100 w-16 h-16 mr-4"></div>

      <div class="flex-grow">
        <!-- Product title -->
        <div class="bg-gray-100 mb-1.5 h-4"></div>
        <div class="w-3/5 bg-gray-100 h-4"></div>
      </div>
    </div>

    <!-- Price -->
    <div class="shrink-0 w-32 text-sm flex flex-col items-start">
      <div class="bg-gray-100 h-4 w-3/5 mb-1.5"></div>
      <div class="bg-gray-100 h-4 w-4/5"></div>
    </div>

    <!-- Add to cart -->
    <div class="shrink-0 w-48 flex flex-col justify-center">
      <div class="flex mb-4">
        <div class="border border-r-0 flex-1 w-full border-gray-100 h-9"></div>
        <div class="bg-gray-100 w-2/5"></div>
      </div>

      <div class="w-2/5 h-5 bg-gray-100"></div>
    </div>

    <!-- Actions -->
    <div class="shrink-0 ml-auto">
      <div class="h-7 w-7 bg-gray-100"></div>
    </div>
  </div>
</template>
