<template>
  <div class="flex min-h-screen flex-col">
    <VcHeader />

    <!-- Main Content -->
    <div class="relative flex grow flex-col">
      <slot />
    </div>

    <VcFooter />
  </div>
</template>

<script setup lang="ts">
import { VcFooter, VcHeader } from "@/shared/layout";
</script>
