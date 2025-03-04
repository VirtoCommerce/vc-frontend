<template>
  <span ref="backToTop" tabindex="-1" />
  <ul class="skip-to-links">
    <li class="skip-to-links__item">
      <a ref="skip-to-links__link" href="#main-layout-content" class="skip-link">{{
        $t("common.links.skip_to_main_content")
      }}</a>
    </li>
    <li class="skip-to-links__item">
      <a ref="skip-to-links__link" href="#footer" class="skip-link">{{ $t("common.links.skip_to_footer") }}</a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const backToTop = ref<HTMLElement | null>(null);

watch(
  () => route.path,
  () => {
    backToTop.value?.focus();
  },
);

onMounted(() => {
  backToTop.value?.focus();
});
</script>

<style lang="scss">
.skip-to-links {
  @apply fixed left-0 top-0 z-50 flex h-10 w-full justify-start opacity-0 bg-primary-50 items-center divide-x-2 text-base text-neutral-800;

  &__item {
    @apply whitespace-nowrap grow text-center;
  }

  &:has(.skip-link:focus) {
    @apply opacity-100;
  }
}
</style>
