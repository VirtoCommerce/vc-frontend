/* eslint-disable @typescript-eslint/no-unused-vars */
<template>
  <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
    <div class="block py-8" v-for="block in template.content" :key="block.id">
      <component :is="block.type" :model="block" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplate } from "./useTemplate";
// import { ref, reactive, onMounted, watch, unref, watchEffect, Ref, shallowRef } from "vue";
// import { onMounted } from "vue";

// import TextComponent from "./blocks/text.vue";
// import Image from "./blocks/image.vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// storefront.com/permalink
//
const { template } = useTemplate("/themes/pages/test.json");

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
