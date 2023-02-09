<template>
  <div
    class="flex flex-col w-full bg-white rounded outline outline-offset-0 outline-1 outline-[color:var(--color-product-outline)] p-6 shadow-t-3sm hover:shadow-lg lg:px-5 lg:pt-5 lg:pb-3.5"
  >
    <!-- Product image -->
    <div class="relative flex flex-col justify-center items-center pb-[87%]">
      <div class="absolute top-0 w-full h-full rounded bg-gray-100"></div>

      <div
        class="z-[2] absolute -top-4 -right-4 px-2 py-3.5 flex flex-col gap-2 rounded-3xl bg-white lg:-right-3 lg:py-2 lg:px-1.5"
      >
        <div class="w-6 h-6 rounded-full bg-gray-100 lg:w-4 lg:h-4"></div>
        <div class="w-6 h-6 rounded-full bg-gray-100 lg:w-4 lg:h-4"></div>
      </div>
    </div>

    <div class="flex flex-col flex-grow pt-3">
      <!-- Product title -->
      <div class="flex flex-col gap-2 my-px">
        <div class="bg-gray-100 h-5"></div>
        <div class="bg-gray-100 h-5 w-2/3"></div>
      </div>

      <div class="grid grid-cols-2 gap-x-2 mt-2 w-full lg:grid-cols-[35%_1fr]">
        <!-- Product props -->
        <div class="pt-0.5 pb-px">
          <div class="w-2/3 h-2.5 bg-gray-100"></div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 flex items-end pt-0.5 pb-px pl-1">
            <div class="w-2/3 h-2.5 bg-gray-100"></div>
          </div>
        </div>
        <div class="pt-0.5 pb-px">
          <div class="w-4/5 h-2.5 bg-gray-100"></div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 flex items-end pt-0.5 pb-px pl-1">
            <div class="w-1/2 h-2.5 bg-gray-100"></div>
          </div>
        </div>
        <div class="pt-0.5 pb-px">
          <div class="w-3/4 h-2.5 bg-gray-100"></div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 flex items-end pt-0.5 pb-px pl-1">
            <div class="w-full h-2.5 bg-gray-100"></div>
          </div>
        </div>
        <div class="pt-0.5 pb-px">
          <div class="w-full h-2.5 bg-gray-100"></div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 flex items-end pt-0.5 pb-px pl-1">
            <div class="w-1/4 h-2.5 bg-gray-100"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product price -->
    <div class="flex items-end gap-2 my-4 lg:my-3">
      <div class="h-4 w-7 bg-gray-100"></div>
      <div class="h-7 w-20 bg-gray-100"></div>
    </div>

    <!-- Add to cart -->
    <div class="flex items-stretch h-9 rounded border-2 border-gray-100">
      <div class="flex items-center justify-center w-1/2">
        <div class="h-4 w-1/5 bg-gray-100"></div>
      </div>
      <div class="flex items-center justify-center w-1/2 bg-gray-100"></div>
    </div>

    <div class="flex items-center gap-1 mt-5">
      <!-- in stock -->
      <div class="h-[22px] w-[76px] rounded-full bg-gray-100"></div>
      <!-- in cart -->
      <div class="h-[22px] w-[58px] rounded-full bg-gray-100"></div>
    </div>
  </div>
</template>
