<template>
  <div class="square relative flex flex-col justify-center items-center border border-gray-100 rounded-sm">
    <img
      :src="activeSrc"
      alt="product.name"
      class="absolute top-0 w-full h-full object-cover object-center rounded-sm"
    />
  </div>
  <div v-if="images && images.length" class="mt-5 grid grid-cols-3 gap-5">
    <div v-for="image in images" :key="image?.url || ''" @click="setActiveImage(image?.url || '')">
      <div
        class="square relative flex flex-col justify-center items-center cursor-pointer border border-gray-100 rounded-sm hover:ring hover:ring-yellow-200"
        :class="{
          'ring ring-yellow-500': image?.url == activeSrc,
        }"
      >
        <img
          :src="image?.url || '/assets/static/images/no-image.png'"
          alt="product.name"
          class="absolute top-0 w-full h-full object-cover object-center rounded-sm"
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
  console.log(activeSrc.value);
});

function setActiveImage(url: string) {
  activeSrc.value = url;
}
</script>
