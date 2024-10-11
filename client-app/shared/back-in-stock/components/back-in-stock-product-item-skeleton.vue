<template>
  <div class="flex items-center gap-x-8 px-6 py-3 pb-5">
    <!-- Name and image -->
    <div class="flex grow items-center">
      <!-- Product image -->
      <div class="mr-4 size-16 border border-neutral-100 bg-neutral-100"></div>

      <div class="grow">
        <!-- Product title -->
        <div class="mb-1.5 h-4 bg-neutral-100"></div>
        <div class="h-4 w-3/5 bg-neutral-100"></div>
      </div>
    </div>

    <!-- Price -->
    <div class="flex w-32 shrink-0 flex-col items-start text-sm">
      <div class="mb-1.5 h-4 w-3/5 bg-neutral-100"></div>
      <div class="h-4 w-4/5 bg-neutral-100"></div>
    </div>

    <!-- Add to cart -->
    <div class="flex w-48 shrink-0 flex-col justify-center">
      <div class="mb-4 flex">
        <div class="h-9 w-full flex-1 border border-r-0 border-neutral-100"></div>
        <div class="w-2/5 bg-neutral-100"></div>
      </div>

      <div class="h-5 w-2/5 bg-neutral-100"></div>
    </div>

    <!-- Actions -->
    <div class="ml-auto shrink-0">
      <div class="size-7 bg-neutral-100"></div>
    </div>
  </div>
</template>
