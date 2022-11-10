<template>
  <div class="min-h-screen flex flex-col font-lato">
    <!-- Header -->
    <div class="flex items-center h-14 lg:h-auto lg:px-12 lg:py-5 bg-[color:var(--color-header-bottom-bg)]">
      <router-link to="/" class="px-6 lg:px-0" replace>
        <VcImage :src="$cfg.logo_image" :alt="$context.storeName" class="h-9 lg:h-12" lazy />
      </router-link>
    </div>

    <!-- Main Content -->
    <div class="relative flex flex-col grow">
      <slot />
    </div>

    <VcFooter compact />
  </div>
</template>

<script setup lang="ts">
import { VcFooter } from "@/shared/layout";
</script>
