<template>
  <div class="min-h-screen flex flex-col font-lato">
    <VcHeader />

    <!-- Main Content -->
    <div class="relative flex flex-col grow">
      <slot />
    </div>

    <VcFooter />
  </div>
</template>

<script setup lang="ts">
import { VcFooter, VcHeader } from "@/shared/layout";
</script>
