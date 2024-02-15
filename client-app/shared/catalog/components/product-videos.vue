<template>
  <div v-if="videos?.items" class="-mx-2 flex flex-wrap">
    <div v-for="(video, index) in videos?.items" :key="index" class="w-1/2 p-2">
      <div
        class="relative aspect-video cursor-pointer rounded border border-[--color-neutral-200] bg-[--color-additional-950]"
        tabindex="0"
        role="button"
        @keydown="openVideoModal(video)"
        @click="openVideoModal(video)"
      >
        <VcImage class="size-full rounded-sm object-cover object-center opacity-60" :src="video.thumbnailUrl" />

        <div
          class="absolute inset-0 flex items-center justify-center text-[--color-additional-50] hover:text-[--color-primary-500]"
        >
          <VcIcon :size="36" name="play" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModal } from "@/shared/modal";
import VideoModal from "./video-modal.vue";
import type { VideoConnection, VideoType } from "@/core/api/graphql/types";

interface IProps {
  videos?: VideoConnection;
}

defineProps<IProps>();

const { openModal } = useModal();

function openVideoModal(video: VideoType) {
  openModal({
    component: VideoModal,
    props: {
      video,
    },
  });
}
</script>
