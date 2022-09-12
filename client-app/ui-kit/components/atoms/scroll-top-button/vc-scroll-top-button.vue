<template>
  <i
    v-if="showScrollButton"
    class="fas fa-arrow-circle-up text-[color:var(--color-primary)] cursor-pointer opacity-60 hover:opacity-100 text-5xl z-20 fixed bottom-10 right-3"
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
