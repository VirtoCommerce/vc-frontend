<template>
  <VcModal :title="video.name" hide-actions max-width="42rem">
    <iframe class="aspect-video w-full" :title="video.name" :src="`${video.embedUrl}?&autoplay=1`" allow="autoplay" />
  </VcModal>
</template>

<script setup lang="ts">
import type { VideoType } from "@/core/api/graphql/types";

interface IProps {
  video: VideoType;
}

defineProps<IProps>();
</script>
