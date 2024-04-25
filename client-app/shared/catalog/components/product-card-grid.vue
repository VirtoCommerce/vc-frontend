<template>
  <div
    class="flex w-full flex-col rounded bg-white p-6 shadow-t-3sm outline outline-1 outline-offset-0 outline-[color:var(--color-product-outline)] hover:shadow-lg xs:p-4 lg:px-5 lg:pb-3.5 lg:pt-5"
  >
    <!-- Product image -->
    <div class="relative flex flex-col items-center justify-center pb-[87%]">
      <div class="absolute top-0 size-full rounded">
        <template v-if="$cfg.image_carousel_in_product_card_enabled && product.images?.length">
          <Swiper
            :modules="[Pagination, Navigation]"
            :navigation="{
              nextEl: '.carousel-button-next',
              prevEl: '.carousel-button-prev',
              lockClass: '!hidden',
            }"
            class="size-full"
            rewind
            @swiper="swiperInstance = $event"
            @slide-change="slideChanged"
          >
            <SwiperSlide v-for="(image, index) in product.images" :key="index" class="rounded">
              <VcImage
                :src="image.url"
                :alt="product.name"
                size-suffix="md"
                :class="{ 'cursor-pointer': swiperInstance?.allowSlideNext }"
                class="size-full select-none rounded object-cover object-center"
                :lazy="lazy || index > 0"
                @click="swiperInstance?.slideNext()"
              />
            </SwiperSlide>

            <template #container-end>
              <!-- Prev button -->
              <div
                class="carousel-button-prev group absolute left-0 top-0 z-[2] hidden h-full cursor-pointer items-center pl-1 pr-5 md:flex"
              >
                <span
                  class="flex size-6 items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <VcIcon class="text-[--color-neutral-400]" name="chevron-left" size="xs" />
                </span>
              </div>

              <!-- Next button -->
              <div
                class="carousel-button-next group absolute right-0 top-0 z-[2] hidden h-full cursor-pointer items-center pl-5 pr-1 md:flex"
              >
                <span
                  class="flex size-6 items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <VcIcon class="text-[--color-neutral-400]" name="chevron-right" size="xs" />
                </span>
              </div>

              <!-- Bullets -->
              <div
                v-if="product.images.length > 1"
                class="absolute bottom-0 left-0 z-[1] flex w-full justify-center gap-1 py-2"
              >
                <template v-for="(state, index) in swiperBulletsState" :key="index">
                  <span
                    v-if="index !== 1 || product.images.length !== 2"
                    :class="[
                      'inline-block size-2 rounded-full border',
                      state
                        ? 'border-gray-400 bg-gray-400 outline outline-[1px] outline-white'
                        : 'box-border border-gray-400 bg-white',
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
          class="size-full rounded object-cover object-center"
          :lazy="lazy"
        />
      </div>

      <DiscountBadge :price="product.price!" />

      <div
        class="absolute -right-4 -top-4 z-[2] flex flex-col gap-2 rounded-3xl bg-white px-2 py-3.5 empty:hidden lg:-right-3 lg:px-1.5 lg:py-2"
      >
        <AddToList :product="product" />
        <AddToCompareCatalog v-if="$cfg.product_compare_enabled" class="relative" :product="product" />
      </div>
    </div>

    <div class="flex grow flex-col pt-3 lg:pt-2.5">
      <!-- Product title -->
      <VcTooltip placement="bottom" strategy="fixed">
        <template #trigger>
          <router-link
            :to="link"
            :target="target"
            class="my-px line-clamp-2 h-12 cursor-pointer text-18 font-extrabold text-[color:var(--color-link)] lg:h-10 lg:text-14"
            @click="$emit('linkClick', $event)"
          >
            {{ product.name }}
          </router-link>
        </template>

        <template #content>
          <div class="max-w-[16rem] rounded-sm bg-additional-50 px-3.5 py-1.5 text-xs shadow-md">
            {{ product.name }}
          </div>
        </template>
      </VcTooltip>

      <div
        class="mt-2 grid w-full grid-cols-2 gap-1.5 text-14 leading-4 text-tooltip empty:hidden lg:mt-0.5 lg:gap-y-0.5 lg:text-11"
      >
        <!-- Product properties -->
        <template v-for="prop in properties" :key="prop.id">
          <div class="min-w-0">
            <div class="truncate font-bold">{{ prop.label }}:</div>
          </div>
          <div class="min-w-0">
            <div class="truncate">
              {{ prop.value }}
            </div>
          </div>
        </template>

        <!-- Rating -->
        <template v-if="false">
          <div class="min-w-0">
            <div class="truncate font-bold">
              {{ $t("shared.catalog.product_card.product_rating") }}
            </div>
          </div>
          <div class="flex items-center gap-1">
            <svg
              class="size-3 shrink-0"
              :class="{
                'text-[color:var(--color-success)]': true,
                'text-[color:var(--color-warning)]': false,
                'text-[color:var(--color-danger)]': false,
              }"
            >
              <use href="/static/images/cup.svg#main"></use>
            </svg>
            <div class="font-bold">4,3/5</div>
          </div>
        </template>

        <!-- Vendor -->
        <template v-if="$cfg.vendor_enabled && product.vendor">
          <div class="min-w-0">
            <div class="truncate font-bold">
              {{ $t("shared.catalog.product_card.product_vendor") }}
            </div>
          </div>
          <div class="min-w-0">
            <div class="truncate">
              <Vendor :vendor="product.vendor" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="grow"></div>

    <!-- Product price -->
    <div class="my-4 lg:my-3">
      <VcItemPriceCatalog :has-variations="hasVariations" :value="price" />
    </div>

    <div v-if="hasVariations" class="flex flex-col">
      <VcButton :to="link" :target="target" variant="outline" size="sm" full-width @click="$emit('linkClick', $event)">
        {{ $t("pages.catalog.variations_button", [(product.variations?.length || 0) + 1]) }}
      </VcButton>

      <router-link
        :to="link"
        class="mt-2.5 flex items-center gap-1 text-14 text-[color:var(--color-link)] lg:mt-[1.35rem] lg:text-11"
        target="_blank"
      >
        <svg class="size-3 shrink-0 text-primary lg:size-2.5">
          <use href="/static/images/link.svg#main"></use>
        </svg>
        <span v-t="'pages.catalog.show_on_a_separate_page'" class="truncate"></span>
      </router-link>
    </div>

    <template v-else>
      <slot name="cart-handler" />

      <div class="mt-1 flex flex-wrap items-center gap-1">
        <InStock
          :is-in-stock="product.availabilityData?.isInStock"
          :is-digital="isDigital"
          :quantity="product.availabilityData?.availableQuantity"
        />

        <CountInCart :product-id="product.id" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, ref } from "vue";
import { PropertyType } from "@/core/api/graphql/types";
import { ProductType } from "@/core/enums";
import { getLinkTarget, getProductRoute, getPropertiesGroupedByName, productHasVariations } from "@/core/utilities";
import { AddToCompareCatalog } from "@/shared/compare";
import { AddToList } from "@/shared/wishlists";
import CountInCart from "./count-in-cart.vue";
import DiscountBadge from "./discount-badge.vue";
import InStock from "./in-stock.vue";
import Vendor from "./vendor.vue";
import type { Product } from "@/core/api/graphql/types";
import type { Swiper as SwiperInstance } from "swiper/types";

defineEmits<{ (eventName: "linkClick", globalEvent: MouseEvent): void }>();

const props = withDefaults(defineProps<IProps>(), {
  lazy: true,
});

interface IProps {
  product: Product;
  lazy?: boolean;
  openInNewTab?: boolean;
}

const swiperInstance = ref<SwiperInstance>();
const swiperBulletsState = ref<boolean[]>([true, false, false]);

const link = computed(() => getProductRoute(props.product.id, props.product.slug));
const target = computed(() => getLinkTarget(props.openInNewTab));
const isDigital = computed(() => props.product.productType === ProductType.Digital);
const properties = computed(() =>
  Object.values(getPropertiesGroupedByName(props.product.properties ?? [], PropertyType.Product)).slice(0, 3),
);
const hasVariations = computed(() => productHasVariations(props.product));
const price = computed(() => (hasVariations.value ? props.product.minVariationPrice : props.product.price));

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
