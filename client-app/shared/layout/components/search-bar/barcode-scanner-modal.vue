<template>
  <VcModal
    :title="$t('shared.layout.search_bar.barcode_detector.title')"
    class="barcode-scanner-modal"
    is-mobile-fullscreen
  >
    <p class="barcode-scanner-modal__description">
      {{ $t("shared.layout.search_bar.barcode_detector.description") }}
    </p>

    <VcWidgetSkeleton v-show="loading">
      <template #default-container>
        <div class="barcode-scanner-modal__skeleton">
          <div class="barcode-scanner-modal__skeleton-inner" />
        </div>
      </template>
    </VcWidgetSkeleton>
    <video
      v-show="!loading"
      ref="videoElement"
      class="barcode-scanner-modal__video"
      playsinline
      @canplaythrough="loading = false"
    >
      <track kind="captions" :label="$t('shared.layout.search_bar.barcode_detector.title')" default disabled src="" />
    </video>
    <template #actions="{ close }">
      <VcButton class="barcode-scanner-modal__action" color="secondary" variant="outline" @click="close">
        {{ $t("shared.catalog.branches_modal.cancel_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { BarcodeDetector } from "barcode-detector/ponyfill";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Logger } from "@/core/utilities";

const emit = defineEmits<{
  (e: "result", value: string[]): void;
}>();

const videoElement = ref<HTMLVideoElement | null>(null);
const videoStream = ref<MediaStream | null>(null);
let barcodeDetector: BarcodeDetector | null = null;

const loading = ref(true);

const SCAN_INTERVAL = 400;

const scan = async () => {
  if (!barcodeDetector || !videoElement.value) {
    return;
  }
  try {
    const imageBitmap = await createImageBitmap(videoElement.value);

    const barcodes = await barcodeDetector.detect(imageBitmap);
    if (barcodes.length) {
      emit(
        "result",
        barcodes.map((el) => el.rawValue),
      );
    }
  } catch (error) {
    Logger.error(scan.name, error);
  }
};

const { resume: startScanner, pause: stopScanner } = useIntervalFn(scan, SCAN_INTERVAL);

async function startCamera() {
  try {
    if (!videoStream.value) {
      videoStream.value = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
    }

    if (videoElement.value) {
      videoElement.value.srcObject = videoStream.value;
      await videoElement.value.play();
    }
  } catch (error) {
    Logger.error(startCamera.name, error);
  }
}

function stopCamera() {
  if (videoStream.value) {
    videoStream.value.getVideoTracks().every((track) => track.stop());
    videoStream.value = null;
  }

  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
}

onMounted(async () => {
  try {
    await startCamera();
    barcodeDetector = new BarcodeDetector();
    startScanner();
  } catch (error) {
    Logger.error("BarcodeDetector initialization error:", error);
  }
});

onBeforeUnmount(() => {
  stopScanner();
  barcodeDetector = null;
  stopCamera();
});
</script>

<style lang="scss">
.barcode-scanner-modal {
  &__description {
    @apply mb-2.5;
  }

  &__video {
    @apply aspect-[3/2] object-cover md:aspect-[2/1];
  }

  &__action {
    @apply ml-auto w-full md:w-auto;
  }

  &__skeleton {
    @apply p-1;
  }

  &__skeleton-inner {
    @apply w-full h-60;
  }
}
</style>
