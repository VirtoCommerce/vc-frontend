<template>
  <div v-if="videos?.items" class="product-videos">
    <div v-for="(video, index) in videos?.items" :key="index" class="product-videos__item">
      <button type="button" class="product-videos__button" @click="openVideoModal(video)">
        <VcImage class="product-videos__image" :src="video.thumbnailUrl" />

        <span class="product-videos__play">
          <VcIcon :size="36" name="play" />
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

<style lang="scss">
.product-videos {
  @apply -mx-2 flex flex-wrap;

  &__item {
    @apply w-1/2 p-2;
  }

  &__button {
    @apply relative aspect-video cursor-pointer border border-neutral-200 bg-additional-950;

    border-radius: var(--vc-radius);
  }

  &__image {
    @apply size-full rounded-sm object-cover object-center opacity-60;
  }

  &__play {
    @apply absolute inset-0 flex items-center justify-center text-additional-50;

    &:hover {
      @apply text-primary;
    }
  }
}
</style>
