<template>
  <div
    class="flex w-full flex-col rounded bg-additional-50 p-6 shadow outline outline-1 outline-offset-0 outline-neutral-200 hover:shadow-lg lg:px-5 lg:pb-3.5 lg:pt-5"
  >
    <!-- Product image -->
    <div class="relative flex flex-col items-center justify-center pb-[87%]">
      <div class="absolute top-0 size-full rounded bg-neutral-100"></div>

      <div
        class="absolute -right-4 -top-4 z-[2] flex flex-col gap-2 rounded-3xl bg-additional-50 px-2 py-3.5 lg:-right-3 lg:px-1.5 lg:py-2"
      >
        <div class="size-6 rounded-full bg-neutral-100 lg:size-4"></div>
        <div class="size-6 rounded-full bg-neutral-100 lg:size-4"></div>
      </div>
    </div>

    <div class="flex grow flex-col pt-3">
      <!-- Product title -->
      <div class="my-px flex flex-col gap-2">
        <div class="h-5 bg-neutral-100"></div>
        <div class="h-5 w-2/3 bg-neutral-100"></div>
      </div>

      <div class="mt-2 grid w-full grid-cols-2 gap-x-2 lg:grid-cols-[35%_1fr]">
        <!-- Product props -->
        <div class="pb-px pt-0.5">
          <div class="h-2.5 w-2/3 bg-neutral-100"></div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 flex items-end pb-px pl-1 pt-0.5">
            <div class="h-2.5 w-2/3 bg-neutral-100"></div>
          </div>
        </div>
        <div class="pb-px pt-0.5">
          <div class="h-2.5 w-4/5 bg-neutral-100"></div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 flex items-end pb-px pl-1 pt-0.5">
            <div class="h-2.5 w-1/2 bg-neutral-100"></div>
          </div>
        </div>
        <div class="pb-px pt-0.5">
          <div class="h-2.5 w-3/4 bg-neutral-100"></div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 flex items-end pb-px pl-1 pt-0.5">
            <div class="h-2.5 w-full bg-neutral-100"></div>
          </div>
        </div>
        <div class="pb-px pt-0.5">
          <div class="h-2.5 w-full bg-neutral-100"></div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 flex items-end pb-px pl-1 pt-0.5">
            <div class="h-2.5 w-1/4 bg-neutral-100"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product price -->
    <div class="my-4 flex items-end gap-2 lg:my-3">
      <div class="h-4 w-7 bg-neutral-100"></div>
      <div class="h-7 w-20 bg-neutral-100"></div>
    </div>

    <!-- Add to cart -->
    <div class="flex h-9 items-stretch rounded border-2 border-neutral-100">
      <div class="flex w-1/2 items-center justify-center">
        <div class="h-4 w-1/5 bg-neutral-100"></div>
      </div>
      <div class="flex w-1/2 items-center justify-center bg-neutral-100"></div>
    </div>

    <div class="mt-5 flex items-center gap-1">
      <!-- in stock -->
      <div class="h-[22px] w-[76px] rounded-full bg-neutral-100"></div>
      <!-- in cart -->
      <div class="h-[22px] w-[58px] rounded-full bg-neutral-100"></div>
    </div>
  </div>
</template>
