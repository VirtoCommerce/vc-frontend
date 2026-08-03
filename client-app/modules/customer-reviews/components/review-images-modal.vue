<template>
  <VcModal class="review-images-modal" hide-actions dividers max-width="50rem">
    <template #title> {{ currentIndex + 1 }} / {{ images.length }} </template>

    <div class="review-images-modal__stage">
      <VcNavButton
        v-if="images.length > 1"
        size="sm"
        direction="left"
        :label="$t('common.buttons.previous')"
        @click="swiper?.slidePrev()"
      />

      <VcCarousel
        class="review-images-modal__carousel"
        :slides="images"
        :pagination="images.length > 1"
        :options="options"
      >
        <template #slide="{ slide, index: slideIndex }">
          <div class="review-images-modal__slide">
            <VcImage
              :src="slide.url"
              :alt="slide.name || `${$t('common.labels.product_review_image')} ${slideIndex + 1}`"
              class="review-images-modal__img"
              lazy
            />
          </div>
        </template>
      </VcCarousel>

      <VcNavButton
        v-if="images.length > 1"
        size="sm"
        direction="right"
        :label="$t('common.buttons.next')"
        @click="swiper?.slideNext()"
      />
    </div>

    <div class="review-images-modal__caption">{{ author }} · {{ date }}</div>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { CustomerReviewImage } from "../api/graphql/types";
import type SwiperCore from "swiper";
import type { SwiperEvents } from "swiper/types";

interface IProps {
  images: CustomerReviewImage[];
  index?: number;
  author: string;
  date: string;
}

const props = withDefaults(defineProps<IProps>(), {
  index: 0,
});

// The modal instance is opened with fixed props, so the initial index is read once intentionally.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const currentIndex = ref(props.index);
const swiper = ref<SwiperCore | null>(null);

const options = computed<ICarouselOptions>(() => ({
  initialSlide: props.index,
  loop: props.images.length > 1,
  // VcCarousel forwards `on` as Vue listeners; swiper/vue re-emits every native Swiper
  // event through `onAny`, so `init` still delivers the instance here.
  on: {
    init: (instance: SwiperCore) => {
      swiper.value = instance;
    },
    slideChange: (instance: SwiperCore) => {
      currentIndex.value = instance.realIndex;
    },
  } as SwiperEvents,
}));

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowLeft") {
    swiper.value?.slidePrev();
  } else if (event.key === "ArrowRight") {
    swiper.value?.slideNext();
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style lang="scss">
.review-images-modal {
  &__stage {
    @apply flex items-center gap-3;
  }

  &__carousel {
    @apply min-w-0 grow;
  }

  &__slide {
    @apply flex h-[50vh] items-center justify-center pb-8;
  }

  &__img {
    @apply size-full object-contain;
  }

  &__caption {
    @apply mt-3 text-sm text-neutral-500;
  }
}
</style>
