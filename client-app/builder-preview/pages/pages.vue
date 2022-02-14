/* eslint-disable @typescript-eslint/no-unused-vars */
<template>
  <div class="block" v-for="block in blocks" :key="block.id">
    <component :is="block.type" :model="block" />
  </div>
</template>

<script setup lang="ts">
// import { ref, reactive, onMounted, watch, unref, watchEffect, Ref, shallowRef } from "vue";
// import { onMounted } from "vue";

// import TextComponent from "./blocks/text.vue";
// import Image from "./blocks/image.vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blocks: any[] = [
  {
    id: 1,
    type: "block-text",
    text: "hello world",
  },
  {
    id: 2,
    type: "block-image",
    img: "https://ik.imagekit.io/je8lpsqkoi/assets/pages/19_qRTyG7N7X6-2_j9uMkjajn9.png",
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// function resolve(type: string): InstanceType<any> | null {
//   return "block-" + type;
//   // switch (type) {
//   //   case "text":
//   //     return TextComponent;
//   //   case "image":
//   //     return Image;
//   // }
//   // return null;
// }

// onMounted(async () => {

// });
</script>
