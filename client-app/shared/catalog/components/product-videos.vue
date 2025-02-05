<template>
  <div v-if="videos?.items" class="-mx-2 flex flex-wrap">
    <div v-for="(video, index) in videos?.items" :key="index" class="w-1/2 p-2">
      <button
        type="button"
        class="relative aspect-video cursor-pointer rounded border border-neutral-200 bg-additional-950"
        @click="openVideoModal(video)"
      >
        <VcImage :src="video.thumbnailUrl" class="size-full rounded-sm object-cover object-center opacity-60"/>

        <span class="absolute inset-0 flex items-center justify-center text-additional-50 hover:text-primary">
          <VcIcon :size="36" name="play"/>
        </span>
      </button>
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
