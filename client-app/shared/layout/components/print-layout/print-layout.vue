<template>
  <div class="flex h-full min-h-screen flex-col">
    <VcHeader />
    <slot />

    <VcFooter />
  </div>
</template>

<script setup lang="ts">
import VcFooter from "../footer/vc-footer.vue";
import VcHeader from "../header/vc-header.vue";
</script>
