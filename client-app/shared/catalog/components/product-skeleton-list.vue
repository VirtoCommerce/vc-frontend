<template>
  <div
    class="vc-product-skeleton-list grid gap-x-3.5 px-4 pt-4 pb-5 bg-white lg:outline lg:outline-offset-0 lg:outline-1 lg:outline-[color:var(--color-product-outline)] lg:py-3.5 lg:rounded lg:place-items-center lg:shadow-t-3sm lg:hover:shadow-lg"
  >
    <div class="vc-product-skeleton-list__mobile-left sm:contents">
      <!-- Product image -->
      <div class="vc-product-skeleton-list__img relative block w-[72px] h-[72px] xl:w-[86px] xl:h-[86px] bg-gray-100"></div>

      <div
        class="vc-product-skeleton-list__buttons flex justify-center gap-3.5 mt-3 w-full sm:justify-start sm:place-self-end lg:mt-3 lg:gap-3"
      >
        <div class="w-5 h-5 rounded-full bg-gray-100 lg:w-4 lg:h-4"></div>
        <div class="w-5 h-5 rounded-full bg-gray-100 lg:w-4 lg:h-4"></div>
      </div>
    </div>

    <!-- Product title -->
    <div class="vc-product-skeleton-list__name flex flex-col gap-1 w-full flex-grow lg:mt-1 2xl:pr-2">
      <div class="bg-gray-100 h-4"></div>
      <div class="bg-gray-100 h-4"></div>
      <div class="bg-gray-100 h-4 w-2/3"></div>
    </div>

    <!-- Product props -->
    <div
      class="vc-product-skeleton-list__properties grid-cols-[40%_1fr] gap-x-1.5 w-full hidden xl:grid"
    >
      <div class="pt-0.5 pb-px">
        <div class="w-1/3 h-2.5 bg-gray-100"></div>
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
        <div class="w-3/5 h-2.5 bg-gray-100"></div>
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

    <div class="vc-product-skeleton-list__price flex items-end gap-2 mt-3.5 w-full sm:mt-0 lg:flex-col 2xl:pr-2">
      <div class="h-4 w-7 bg-gray-100"></div>
      <div class="h-7 w-20 bg-gray-100"></div>
    </div>

    <div class="vc-product-skeleton-list__add-to-cart flex flex-col gap-2 mt-3 w-full sm:mt-2.5">
      <!-- Add to cart -->
      <div class="flex items-stretch h-9 rounded border border-2 border-gray-100">
        <div class="flex items-center justify-center w-1/2">
          <div class="h-4 w-1/5 bg-gray-100"></div>
        </div>
        <div class="flex items-center justify-center w-1/2 bg-gray-100"></div>
      </div>

      <div class="flex items-center gap-1">
        <!-- in stock -->
        <div class="h-[22px] w-[76px] rounded-full bg-gray-100"></div>
        <!-- in cart -->
        <div class="h-[22px] w-[58px] rounded-full bg-gray-100"></div>
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
