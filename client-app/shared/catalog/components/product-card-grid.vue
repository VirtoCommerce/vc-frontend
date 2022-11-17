<template>
  <div
    class="flex flex-col w-full bg-white rounded outline outline-offset-0 outline-1 outline-[color:var(--color-product-outline)] p-6 shadow-t-3sm hover:shadow-lg lg:px-5 lg:pt-5 lg:pb-3.5"
  >
    <!-- Product image -->
    <div class="relative flex flex-col justify-center items-center pb-[87%]">
      <div class="absolute top-0 w-full h-full rounded">
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
            <SwiperSlide v-for="(image, index) in product.images" :key="index" class="rounded">
              <VcImage
                :src="image.url"
                :alt="product.name"
                size-suffix="md"
                :class="{ 'cursor-pointer': swiperInstance?.allowSlideNext }"
                class="w-full h-full rounded object-cover object-center select-none"
                lazy
                @click="swiperInstance?.slideNext()"
              />
            </SwiperSlide>

            <template v-slot:container-end>
              <!-- Prev button -->
              <div
                class="hidden carousel-button-prev group absolute top-0 left-0 z-[2] h-full md:flex items-center pl-1 pr-5 cursor-pointer"
              >
                <span
                  class="group-hover:opacity-100 opacity-0 transition-opacity flex items-center justify-center w-6 h-6 bg-white rounded-full"
                >
                  <i class="fas fa-chevron-left text-sm text-gray-400 -ml-0.5" />
                </span>
              </div>

              <!-- Next button -->
              <div
                class="hidden carousel-button-next group absolute top-0 right-0 z-[2] h-full md:flex items-center pl-5 pr-1 cursor-pointer"
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
                      state
                        ? 'bg-gray-400 border-gray-400 outline outline-[1px] outline-white'
                        : 'bg-white border-gray-400 box-border',
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
          class="w-full h-full rounded object-cover object-center"
          lazy
        />
      </div>

      <DiscountBadge :price="product.price!" />

      <div
        class="z-[2] absolute -top-4 -right-4 px-2 py-3.5 flex flex-col gap-2 rounded-3xl bg-white lg:-right-3 lg:py-2 lg-px-1.5 empty:hidden"
      >
        <slot name="add-to-list-handler"></slot>
        <AddToCompare class="relative" v-if="$cfg.product_compare_enabled" :product="product" />
      </div>
    </div>

    <div class="flex flex-col flex-grow pt-3 lg:pt-2.5">
      <!-- Product title -->
      <router-link
        :to="link"
        class="my-px h-12 text-18 text-[color:var(--color-link)] font-extrabold line-clamp-2 cursor-pointer lg:h-10 lg:text-14"
        :title="product.name"
      >
        {{ product.name }}
      </router-link>

      <div
        class="grid grid-cols-2 gap-x-1.5 mt-2 w-full text-tooltip text-14 leading-4 lg:grid-cols-[max-content_1fr] lg:mt-0.5 lg:text-11 empty:hidden"
      >
        <!-- Product props -->
        <template v-if="product.properties">
          <template v-for="prop in product.properties.slice(0, 3)" :key="prop.id">
            <div class="pt-0.5 pb-px font-bold capitalize">{{ prop.name.toLowerCase() }}:</div>
            <div class="relative">
              <div class="absolute inset-0 flex items-end pt-0.5 pb-px pl-1">
                <div class="truncate">
                  {{ prop.value }}
                </div>
              </div>
            </div>
          </template>
        </template>

        <!-- Raiting -->
        <template v-if="false">
          <div class="pt-0.5 pb-px font-bold capitalize">
            {{ $t("shared.catalog.product_card.product_rating") }}
          </div>
          <div class="flex items-center gap-1 pt-0.5 pb-px pl-1">
            <svg
              class="shrink-0 w-3 h-3"
              :class="{ 'text-status-success': true, 'text-status-warning': false, 'text-status-error': false }"
            >
              <use href="/static/images/cup.svg#main"></use>
            </svg>
            <div class="font-bold">4,3/5</div>
          </div>
        </template>

        <!-- Vendor -->
        <template v-if="product.vendor">
          <div class="pt-0.5 pb-px font-bold capitalize">
            {{ $t("shared.catalog.product_card.product_vendor") }}
          </div>
          <div class="relative">
            <div class="absolute inset-0 flex items-end pt-0.5 pb-px pl-1">
              <div class="truncate text-link">{{ product.vendor.name }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="grow"></div>

    <!-- Product price -->
    <div class="my-4 lg:my-3">
      <VcItemPrice :variations="product.variations" :value="product.price" />
    </div>

    <slot name="cart-handler"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import { Pagination, Navigation, Lazy } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue"; // eslint-disable-line import/no-unresolved
import { Swiper as SwiperInstance } from "swiper/types";
import { AddToCompare } from "@/shared/compare";
import { Product } from "@/xapi/types";
import { RouteLocationRaw } from "vue-router";
import { getProductRoute, DiscountBadge } from "@/shared/catalog";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const swiperInstance = ref<SwiperInstance>();
const swiperBulletsState = ref<boolean[]>([true, false, false]);

const link = computed<RouteLocationRaw>(() => getProductRoute(props.product));

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
