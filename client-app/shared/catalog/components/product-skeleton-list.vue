<template>
  <div
    class="vc-product-skeleton-list grid gap-x-3.5 bg-additional-50 px-4 pb-5 pt-4 lg:place-items-center lg:rounded lg:py-3.5 lg:shadow lg:outline lg:outline-1 lg:outline-offset-0 lg:outline-neutral-200 lg:hover:shadow-lg"
  >
    <div class="vc-product-skeleton-list__mobile-left sm:contents">
      <!-- Product image -->
      <div class="vc-product-skeleton-list__img relative block size-[72px] bg-neutral-100 xl:size-[86px]"></div>

      <div
        class="vc-product-skeleton-list__buttons mt-3 flex w-full justify-center gap-3.5 sm:justify-start sm:place-self-end lg:mt-3 lg:gap-3"
      >
        <div class="size-5 rounded-full bg-neutral-100 lg:size-4"></div>
        <div class="size-5 rounded-full bg-neutral-100 lg:size-4"></div>
      </div>
    </div>

    <!-- Product title -->
    <div class="vc-product-skeleton-list__name flex w-full grow flex-col gap-1 lg:mt-1 2xl:pr-2">
      <div class="h-4 bg-neutral-100"></div>
      <div class="h-4 bg-neutral-100"></div>
      <div class="h-4 w-2/3 bg-neutral-100"></div>
    </div>

    <!-- Product props -->
    <div class="vc-product-skeleton-list__properties hidden w-full grid-cols-[40%_1fr] gap-x-1.5 xl:grid">
      <div class="pb-px pt-0.5">
        <div class="h-2.5 w-1/3 bg-neutral-100"></div>
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
        <div class="h-2.5 w-3/5 bg-neutral-100"></div>
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

    <div class="vc-product-skeleton-list__price mt-3.5 flex w-full items-end gap-2 sm:mt-0 lg:flex-col 2xl:pr-2">
      <div class="h-4 w-7 bg-neutral-100"></div>
      <div class="h-7 w-20 bg-neutral-100"></div>
    </div>

    <div class="vc-product-skeleton-list__add-to-cart mt-3 flex w-full flex-col gap-2 sm:mt-2.5">
      <!-- Add to cart -->
      <div class="flex h-9 items-stretch rounded border-2 border-neutral-100">
        <div class="flex w-1/2 items-center justify-center">
          <div class="h-4 w-1/5 bg-neutral-100"></div>
        </div>
        <div class="flex w-1/2 items-center justify-center bg-neutral-100"></div>
      </div>

      <div class="flex items-center gap-1">
        <!-- in stock -->
        <div class="h-[22px] w-[76px] rounded-full bg-neutral-100"></div>
        <!-- in cart -->
        <div class="h-[22px] w-[58px] rounded-full bg-neutral-100"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vc-product-skeleton-list {
  grid-template-columns: 72px 1fr;
  grid-template-areas:
    "mobile-left name"
    "mobile-left properties"
    "mobile-left price"
    "mobile-left add-to-cart"
    "mobile-left .";

  @media (min-width: theme("screens.sm")) {
    grid-template-columns: 72px 1fr 40%;
    grid-template-areas:
      "img name price"
      "img name add-to-cart"
      "img properties add-to-cart"
      "img buttons add-to-cart";
  }

  @media (min-width: theme("screens.lg")) {
    grid-template-columns: 72px 1fr 126px 207px;
    grid-template-areas:
      "img name price add-to-cart"
      "img properties price add-to-cart"
      "img buttons price add-to-cart"
      "img . price add-to-cart";
  }

  @media (min-width: theme("screens.xl")) {
    grid-template-columns: 86px 1fr 31.5% 140px 207px;
    grid-template-areas:
      "img name properties price add-to-cart"
      "img buttons properties price add-to-cart"
      "img . properties price add-to-cart";
  }

  &__mobile-left {
    grid-area: mobile-left;
  }

  &__img {
    grid-area: img;
  }

  &__buttons {
    grid-area: buttons;
  }

  &__name {
    grid-area: name;
  }

  &__properties {
    grid-area: properties;
  }

  &__price {
    grid-area: price;
  }

  &__add-to-cart {
    grid-area: add-to-cart;
  }
}
</style>
