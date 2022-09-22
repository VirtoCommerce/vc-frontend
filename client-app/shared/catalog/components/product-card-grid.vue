<template>
  <div class="flex flex-col bg-white rounded border p-4 shadow-sm hover:shadow-lg overflow-hidden">
    <!-- Product image -->
    <div class="relative flex flex-col justify-center items-center pb-[100%]">
      <div class="absolute top-0 w-full h-full border border-gray-100 rounded overflow-hidden">
        <template v-if="$cfg.image_carousel_in_product_card_enabled && product.images?.length">
          <Swiper
            :modules="[Pagination, Navigation, Lazy]"
            :navigation="{
              nextEl: '.carousel-button-next',
              prevEl: '.carousel-button-prev',
              lockClass: '!hidden',
            }"
            class="w-full h-full"
            rewind
            lazy
            @swiper="swiperInstance = $event"
            @slideChange="slideChanged"
          >
            <SwiperSlide v-for="(image, index) in product.images" :key="index" class="">
              <VcImage
                :src="image.url"
                :alt="product.name"
                size-suffix="md"
                :class="{ 'cursor-pointer': swiperInstance?.allowSlideNext }"
                class="w-full h-full object-cover object-center select-none"
                lazy
                @click="swiperInstance?.slideNext()"
              />
            </SwiperSlide>

            <template v-slot:container-end>
              <!-- Prev button -->
              <div
                class="carousel-button-prev group absolute top-0 left-0 z-[2] h-full hidden md:flex items-center pl-1 pr-5 cursor-pointer"
              >
                <span
                  class="group-hover:opacity-100 opacity-0 transition-opacity flex items-center justify-center w-6 h-6 bg-white rounded-full"
                >
                  <i class="fas fa-chevron-left text-sm text-gray-400 -ml-0.5" />
                </span>
              </div>

              <!-- Next button -->
              <div
                class="carousel-button-next group absolute top-0 right-0 z-[2] h-full hidden md:flex items-center pl-5 pr-1 cursor-pointer"
              >
                <span
                  class="group-hover:opacity-100 opacity-0 transition-opacity flex items-center justify-center w-6 h-6 bg-white rounded-full"
                >
                  <i class="fas fa-chevron-right text-sm text-gray-400 -mr-0.5" />
                </span>
              </div>

              <!-- Bullets -->
              <div
                v-if="product.images.length > 1"
                class="absolute bottom-0 left-0 z-[1] flex gap-1 w-full justify-center py-2"
              >
                <template v-for="(state, index) in swiperBulletsState" :key="index">
                  <span
                    v-if="index !== 1 || product.images.length !== 2"
                    :class="[
                      'inline-block w-2 h-2 rounded-full border',
                      state ? 'bg-gray-400 border-white box-content -m-px' : 'bg-white border-gray-400 box-border',
                    ]"
                  />
                </template>
              </div>
            </template>
          </Swiper>
        </template>

        <VcImage
          v-else
          :src="product.imgSrc"
          :alt="product.name"
          size-suffix="md"
          class="w-full h-full object-cover object-center"
          lazy
        />

        <!-- Discount badge -->
        <div
          v-if="discount"
          class="absolute z-10 top-0 right-0 px-2 pt-1 pb-1.5 rounded-bl bg-[color:var(--color-sale-badge-bg)] text-white text-xs font-extrabold"
        >
          {{ discount }}
        </div>
      </div>
    </div>

    <div class="flex flex-col flex-grow pt-3 xl:pt-3">
      <div class="mb-1.5 xl:inline-flex xl:flex-wrap xl:items-center xl:justify-between xl:mb-2">
        <AddToCompare v-if="$cfg.product_compare_enabled" :product="product" class="mb-2 xl:my-0.5 xl:pr-0.5" />

        <VcInStock
          :is-in-stock="product.availabilityData?.isInStock"
          :quantity="product.availabilityData?.availableQuantity"
          class="inline-block my-0.5"
        />
      </div>

      <!-- Product title -->
      <router-link
        :to="link"
        class="text-[color:var(--color-link)] font-extrabold text-sm mb-3 flex-grow line-clamp-3 overflow-hidden cursor-pointer"
        :title="product.name"
      >
        {{ product.name }}
      </router-link>

      <!-- Product props -->
      <div class="hidden md:block text-sm pb-2">
        <div class="flex items-baseline justify-between gap-x-2">
          <div class="font-bold text-xs" v-t="'shared.catalog.product_card.product_sku_label'"></div>
          <span class="text-[color:var(--color-link)] truncate">{{ product.code }}</span>
        </div>
      </div>

      <!-- Product price -->
      <div class="flex h-10 md:h-8 flex-col md:flex-row items-baseline justify-between text-sm mb-5 gap-x-2">
        <div class="font-bold text-xs" v-t="'shared.catalog.product_card.price_label'"></div>
        <VcItemPrice :value="product.price" />
      </div>

      <slot name="cart-handler"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import { computedEager } from "@vueuse/core";
import { Pagination, Navigation, Lazy } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue"; // eslint-disable-line import/no-unresolved
import { Swiper as SwiperInstance } from "swiper/types";
import { AddToCompare } from "@/shared/compare";
import { Product } from "@/xapi/types";
import { RouteLocationRaw } from "vue-router";
import { getProductRoute, getProductDiscountLabel } from "@/shared/catalog";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const swiperInstance = ref<SwiperInstance>();
const swiperBulletsState = ref<boolean[]>([true, false, false]);

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product));

const discount = computedEager<string | null>(() => getProductDiscountLabel(props.product.price!));

function slideChanged(swiper: SwiperInstance) {
  const activeIndex: number = swiper.activeIndex;
  const lastIndex: number = props.product.images?.length ? props.product.images.length - 1 : 0;

  if (!activeIndex) {
    // first bullet active
    swiperBulletsState.value = [true, false, false];
  } else if (activeIndex === lastIndex) {
    // last bullet active
    swiperBulletsState.value = [false, false, true];
  } else {
    // middle bullet active
    swiperBulletsState.value = [false, true, false];
  }
}
</script>
