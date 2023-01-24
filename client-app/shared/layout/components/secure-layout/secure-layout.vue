<template>
  <div class="min-h-screen flex flex-col font-lato">
    <!-- Header -->
    <div
      class="flex items-center justify-between h-14 lg:h-auto px-6 lg:px-12 lg:py-5 gap-3 z-10 shadow-md bg-[color:var(--color-header-bottom-bg)]"
    >
      <router-link to="/" replace>
        <VcImage :src="$cfg.logo_image" :alt="$context.storeName" class="h-9 lg:h-12" lazy />
      </router-link>

      <div class="flex items-center gap-x-1.5 text-gray-500">
        <VcIcon size="xs" name="lock-closed" />

        <span class="hidden xs:inline text-14 font-semibold">
          {{ $t("common.labels.secure_checkout") }}
        </span>
      </div>
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
