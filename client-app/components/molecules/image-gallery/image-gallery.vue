<template>
  <div
    ref="mainImageDiv"
    class="square relative flex flex-col justify-center items-center border border-gray-100 rounded-sm"
  >
    <VcImage :src="activeSrc" class="absolute top-0 w-full h-full object-cover object-center rounded-sm" />
  </div>
  <div v-if="isMobile && images && images.length > 1" class="mt-4 flex flex-row justify-center space-x-2.5">
    <div
      v-for="(image, i) in images"
      :key="image?.url || i"
      class="border border-[color:var(--color-primary)] w-4 h-4 rounded-full cursor-pointer"
      :class="{
        'bg-[color:var(--color-primary)]': image?.url == activeSrc,
      }"
      @click="setActiveImage(image?.url)"
    ></div>
  </div>
  <div v-if="!isMobile && images && images.length > 1" class="mt-6 grid grid-cols-3 gap-5">
    <div v-for="(image, i) in images" :key="image?.url || i" @click="setActiveImage(image?.url)">
      <div
        class="square relative flex flex-col justify-center items-center cursor-pointer border border-gray-100 rounded-sm hover:ring hover:ring-yellow-200"
        :class="{
          'ring ring-[color:var(--color-primary)]': image?.url == activeSrc,
        }"
      >
        <VcImage
          :src="image?.url"
          :alt="image?.name"
          class="absolute top-0 w-full h-full object-cover object-center rounded-sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@/components";
import { ImageType, Maybe } from "@/core/api/graphql/types";
import { watchEffect, PropType, ref } from "vue";
import { SwipeDirection, useSwipe } from "@vueuse/core";
import _ from "lodash";

const mainImageDiv = ref(null);

useSwipe(mainImageDiv, {
  onSwipeEnd: (e, direction) => {
    if (direction !== SwipeDirection.LEFT && direction !== SwipeDirection.RIGHT && props.images.length < 2) {
      return;
    }
    const activeImageIndex = _.findIndex(props.images, (x) => x?.url === activeSrc.value);

    if (direction === SwipeDirection.LEFT && activeImageIndex < props.images.length - 1) {
      const newActiveImageIndex = activeImageIndex + 1;
      activeSrc.value = props.images[newActiveImageIndex]?.url ?? "";
    }

    if (direction === SwipeDirection.RIGHT && activeImageIndex > 0) {
      const newActiveImageIndex = activeImageIndex - 1;
      activeSrc.value = props.images[newActiveImageIndex]?.url ?? "";
    }
  },
});

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  images: {
    type: Object as PropType<Array<Maybe<ImageType>>>,
    default: () => new Array<Maybe<ImageType>>(),
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const activeSrc = ref("");

watchEffect(() => {
  activeSrc.value = props.src;
});

function setActiveImage(url?: string | null) {
  activeSrc.value = url || "";
}
</script>
