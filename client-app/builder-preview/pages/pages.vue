<template>
  <div class="block" v-for="block in blocks" :key="block.id">
    <component :is="block.type" :model="block" />
  </div>
</template>

<script setup lang="ts">
// import { ref, reactive, onMounted, watch, unref, watchEffect, Ref, shallowRef } from "vue";
// import { onMounted } from "vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blocks: any[] = [
  {
    id: 1,
    type: "key",
    text: "hello world",
  },
  {
    id: 2,
    type: "image",
    img: "https://ik.imagekit.io/je8lpsqkoi/assets/pages/19_qRTyG7N7X6-2_j9uMkjajn9.png",
  },
];

// onMounted(async () => {

// });
</script>
