<template>
  <i
    v-if="showScrollButton"
    class="fas fa-arrow-circle-up text-primary-300 cursor-pointer hover:text-primary-500 text-5xl z-20 fixed bottom-10 right-3"
    @click="scrollToTop"
  ></i>
</template>
<script setup lang="ts">
import { ref } from "vue";

const showScrollButton = ref(false);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

window.onscroll = () => {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    showScrollButton.value = true;
  } else {
    showScrollButton.value = false;
  }
};
</script>
