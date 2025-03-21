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
    <input
      ref="fileInputRef"
      type="file"
      class="barcode-scanner-modal__input"
      accept="image/*"
      @input="onFileSelected"
    />

    <template #actions="{ close }">
      <VcButton class="barcode-scanner-modal__action-browse" color="secondary" @click="openFilePicker">{{
        $t("ui_kit.file_uploader.browse")
      }}</VcButton>
      <VcButton class="barcode-scanner-modal__action-cancel" color="secondary" variant="outline" @click="close">
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
import { useNotifications } from "@/shared/notification";

const emit = defineEmits<{
  (e: "result", value: string[]): void;
}>();

const videoElement = ref<HTMLVideoElement | null>(null);
const videoStream = ref<MediaStream | null>(null);
let barcodeDetector: BarcodeDetector | null = null;

const loading = ref(true);

const SCAN_INTERVAL = 400;

const fileInputRef = ref<HTMLInputElement>();

const notifications = useNotifications();

function openFilePicker() {
  fileInputRef.value?.click();
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  try {
    if (!file) {
      showInfo("no file detected");
      return;
    }

    const barcodes = await barcodeDetector?.detect(file);

    if (barcodes?.length) {
      emitResult(barcodes);
    } else {
      showInfo("no barcodes found on your photo");
    }
  } catch (e) {
    Logger.error(onFileSelected.name, e);
  }
}

const scan = async () => {
  if (!barcodeDetector || !videoElement.value) {
    return;
  }
  try {
    const imageBitmap = await createImageBitmap(videoElement.value);

    const barcodes = await barcodeDetector?.detect(imageBitmap);
    if (barcodes?.length) {
      emitResult(barcodes);
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

function showInfo(text: string) {
  notifications.info({
    text,
    duration: 5000,
    single: true,
  });
}

function emitResult(barcodes: { rawValue: string }[]) {
  emit(
    "result",
    barcodes.map((el) => el.rawValue),
  );
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

  &__action-cancel {
    @apply ml-auto md:w-auto;
  }

  &__skeleton {
    @apply p-1;
  }

  &__skeleton-inner {
    @apply h-60 w-full #{!important};
  }

  &__input {
    @apply hidden;
  }
}
</style>
