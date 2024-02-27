<template>
  <div class="flex min-h-screen flex-col font-lato">
    <VcHeader />

    <!-- Main Content -->
    <div class="relative flex grow flex-col">
      <slot />
    </div>

    <VcFooter />
  </div>
</template>

<script setup lang="ts">
import VcFooter from "@/shared/layout/components/footer/vc-footer.vue";
import VcHeader from "@/shared/layout/components/header/vc-header.vue";
</script>
