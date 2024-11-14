<template>
  <div class="flex items-center gap-2" :class="{ 'justify-center': centered }">
    <VcLoader class="inline-block size-6 text-primary" />

    <span class="animate-pulse font-bold">
      {{ $t("common.messages.loading_text") }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  centered: Boolean,
});
</script>
