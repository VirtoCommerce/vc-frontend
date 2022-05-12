<template>
  <slot>
    <i
      v-if="isButtonVisible"
      class="text-primary-300 cursor-pointer hover:text-primary-500 text-5xl z-20 fixed bottom-10 right-3"
      :class="[$attrs.class, icon]"
      @click="scrollToTop"
    ></i>
  </slot>
</template>

<script setup lang="ts">
/**
 * Button which becomes visible after scroll and allows fast scroll to top of the page.
 */

import { ref } from "vue";

const props = defineProps({
  /**
   * Set the scroll distance to show the button.
   */
  threshold: {
    type: Number,
    default: 20,
  },

  /**
   * Button icon.
   */
  icon: {
    type: String,
    default: "fas fa-arrow-circle-up",
  },
});

const emit = defineEmits(["click"]);

const isButtonVisible = ref(false);

function scrollToTop(): void {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  emit("click");
}

window.onscroll = () => {
  if (document.body.scrollTop > props.threshold || document.documentElement.scrollTop > props.threshold) {
    isButtonVisible.value = true;
  } else {
    isButtonVisible.value = false;
  }
};
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
