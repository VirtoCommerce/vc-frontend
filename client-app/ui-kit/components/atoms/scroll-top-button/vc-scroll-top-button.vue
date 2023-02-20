<template>
  <button
    v-if="showScrollButton"
    type="button"
    class="fas fa-arrow-circle-up fixed bottom-10 right-3 z-20 cursor-pointer text-5xl text-[color:var(--color-primary)] opacity-60 hover:opacity-100"
    @click="scrollToTop"
  ></button>
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
