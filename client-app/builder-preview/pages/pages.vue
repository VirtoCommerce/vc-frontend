/* eslint-disable @typescript-eslint/no-unused-vars */
<template>
  <div class="block" v-for="block in template.content" :key="block.id">
    <component :is="block.type" :model="block" />
  </div>
</template>

<script setup lang="ts">
import { useTemplate } from "./useTemplate";
// import { ref, reactive, onMounted, watch, unref, watchEffect, Ref, shallowRef } from "vue";
// import { onMounted } from "vue";

// import TextComponent from "./blocks/text.vue";
// import Image from "./blocks/image.vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any

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
