<template>
  <VcModal title="Barcode and QR Code Scanner" class="barcode-scanner-modal">
    <div class="relative">
      <video ref="videoElement" playsinline>
        <track kind="captions" src="" label="Barcode Scanner" default disabled />
      </video>
    </div>
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

const SCAN_INTERVAL = 400;

const videoElement = ref<HTMLVideoElement | null>(null);
const videoStream = ref<MediaStream | null>(null);
let barcodeDetector: BarcodeDetector | null = null;

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
