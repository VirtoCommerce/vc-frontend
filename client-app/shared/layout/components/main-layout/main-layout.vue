<template>
  <div class="min-h-screen flex flex-col font-lato">
    <VcHeader />

    <!-- Main Content -->
    <main class="relative flex flex-col grow">
      <slot />
    </main>

    <VcFooter />
  </div>
</template>

<script setup lang="ts">
import { VcFooter, VcHeader } from "@/shared/layout";
</script>
