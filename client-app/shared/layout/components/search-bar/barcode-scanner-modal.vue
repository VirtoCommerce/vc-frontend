<template>
  <VcModal :title="$t('shared.layout.search_bar.barcode_scanner_modal.title')" class="barcode-scanner-modal">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-base font-medium">{{ $t("shared.layout.search_bar.scan_barcode") || "Scan Barcode" }}</h3>
      <VcButton icon="delete-thin" variant="no-background" @click="handleClose" />
    </div>

    <div class="relative">
      <video ref="videoElement" class="h-[240px] w-full rounded bg-neutral-100 object-cover" playsinline>
        <track kind="captions" src="" label="Barcode Scanner" default disabled />
      </video>
      <div
        class="scanner-border pointer-events-none absolute inset-0 rounded border-2 border-primary"
        :class="{ 'border-success': scannedValue }"
      ></div>
    </div>

    <div class="mt-3 flex items-center justify-between">
      <span v-if="scannedValue" class="max-w-[200px] truncate text-sm font-medium">
        {{ scannedValue }}
      </span>
    </div>
  </VcModal>
</template>

<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { BarcodeDetector } from "barcode-detector/ponyfill";
import { ref, onMounted, onBeforeUnmount } from "vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

const emit = defineEmits<{
  (e: "value", value: string): void;
  (e: "result", value: string): void;
}>();

const props = defineProps<{
  onClose: () => void;
}>();

const SCAN_INTERVAL = 400;
const videoElement = ref<HTMLVideoElement | null>(null);
const scannedValue = ref("");
const videoStream = ref<MediaStream | null>(null);
const scansAmount = ref(0);

// todo init in hook
const barcodeDetector = new BarcodeDetector();

const scan = async () => {
  if (!barcodeDetector || !videoElement.value) {
    return;
  }

  try {
    const imageBitmap = await createImageBitmap(videoElement.value);

    const barcodes = await barcodeDetector.detect(imageBitmap);
    barcodes.forEach((barcode) => {
      emit("result", barcode.rawValue);
    });

    scansAmount.value++;
  } catch (error) {
    console.error("Error during barcode scanning", error);
  }
};

const { resume: startScanner, pause: stopScanner } = useIntervalFn(scan, SCAN_INTERVAL);

const handleClose = () => {
  stopScanner();
  stopCamera();
  props.onClose();
};

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
    console.error("Error accessing camera:", error);
  }
}

function stopCamera() {
  if (videoStream.value) {
    videoStream.value.getTracks().forEach((track) => track.stop());
    videoStream.value = null;
  }

  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
}

onMounted(async () => {
  try {
    await startCamera();
    startScanner();
  } catch (error) {
    console.error("BarcodeDetector initialization error:", error);
  }
});

onBeforeUnmount(() => {
  stopScanner();
  stopCamera();
});
</script>
