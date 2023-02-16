<template>
  <div class="flex min-h-screen flex-col font-lato">
    <!-- Header -->
    <div
      class="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 bg-[color:var(--color-header-bottom-bg)] px-6 shadow-md lg:h-auto lg:px-12 lg:py-5"
    >
      <router-link to="/" replace>
        <VcImage :src="$cfg.logo_image" :alt="$context.storeName" class="h-9 lg:h-12" lazy />
      </router-link>

      <div class="flex items-center gap-x-1.5 text-gray-500">
        <VcIcon size="xs" name="lock-closed" />

        <span class="hidden text-14 font-semibold xs:inline">
          {{ $t("common.labels.secure_checkout") }}
        </span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative flex grow flex-col">
      <slot />
    </div>

    <VcFooter compact />
  </div>
</template>

<script setup lang="ts">
import { VcFooter } from "@/shared/layout";
</script>
