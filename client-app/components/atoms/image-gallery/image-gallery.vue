<template>
  <div class="square relative flex flex-col justify-center items-center border border-gray-100">
    <img
      :src="activeSrc || '/assets/static/images/no-image.png'"
      alt="product.name"
      class="absolute top-0 w-full h-full object-cover object-center"
    />
  </div>
  <div v-if="images && images.length" class="mt-5 grid grid-cols-3 gap-5">
    <div
      v-for="image in images"
      :key="image?.url || ''"
      class="hover:shadow-md"
      :class="{ 'border-2': image?.url == activeSrc }"
      @click="setActiveImage(image?.url || '')"
    >
      <div class="square relative flex flex-col justify-center items-center border border-gray-100">
        <img
          :src="image?.url || '/assets/static/images/no-image.png'"
          alt="product.name"
          class="absolute top-0 w-full h-full object-cover object-center"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ImageType, Maybe } from "@/core/api/graphql/types";
import { onMounted, ref } from "vue";

const props = defineProps<{ src: string; images: Array<Maybe<ImageType>> }>();

const activeSrc = ref("");

onMounted(() => {
  activeSrc.value = props.src;
});

function setActiveImage(url: string) {
  activeSrc.value = url;
}
</script>
