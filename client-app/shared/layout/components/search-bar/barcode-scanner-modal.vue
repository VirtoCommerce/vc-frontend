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

    <div v-if="errorMessage" class="text-error mt-2 text-sm">
      {{ errorMessage }}
    </div>

    <div class="mt-3 flex items-center justify-between">
      <span v-if="scannedValue" class="max-w-[200px] truncate text-sm font-medium">
        {{ scannedValue }}
      </span>
      <div class="ml-auto flex gap-2">
        <VcButton v-if="isScannerActive" variant="outline" size="sm" @click="stopScanner">
          {{ $t("shared.layout.search_bar.pause") || "Pause" }}
        </VcButton>
        <VcButton v-else variant="outline" size="sm" @click="startScanner">
          {{ $t("shared.layout.search_bar.resume") || "Resume" }}
        </VcButton>
        <VcButton v-if="scannedValue" variant="solid" size="sm" @click="useScannedValue">
          {{ $t("shared.layout.search_bar.use") || "Use" }}
        </VcButton>
      </div>
      {{ errorText }}
    </div>
  </VcModal>
</template>

<script setup lang="ts">
import { BarcodeDetector } from "barcode-detector/ponyfill";
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { BarcodeDetector as BarcodeDetectorType } from "barcode-detector";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

const emit = defineEmits<{
  (e: "value", value: string): void;
  (e: "result", value: string): void;
}>();

// Define props and emits
const props = defineProps<{
  onClose: () => void;
}>();

// State variables
const videoElement = ref<HTMLVideoElement | null>(null);
const isScannerActive = ref(false);
const scannedValue = ref("");
const errorMessage = ref("");
const videoStream = ref<MediaStream | null>(null);
const barcodeDetector = ref<BarcodeDetectorType | null>(null);
const detectionInterval = ref<number | null>(null);

const errorText = ref("");

// Clean up resources and close the modal
const handleClose = () => {
  stopScanner();
  cleanupCamera();
  props.onClose();
};

// Clean up camera resources
const cleanupCamera = () => {
  if (videoStream.value) {
    videoStream.value.getTracks().forEach((track) => track.stop());
    videoStream.value = null;
  }

  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
};

// Check if BarcodeDetector is supported
onMounted(async () => {
  try {
    barcodeDetector.value = new BarcodeDetector({
      formats: ["qr_code", "ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "code_93", "data_matrix", "itf"],
    });
    // Start scanner automatically on mount
    await startScanner();
  } catch (error) {
    console.error("BarcodeDetector initialization error:", error);
    errorMessage.value = "Barcode detector could not be initialized";
  }
});

// Clean up on component unmount
onBeforeUnmount(() => {
  console.log("unmount");
  stopScanner();
  cleanupCamera();
});

// Start video stream and barcode detection
const startScanner = async () => {
  if (!barcodeDetector.value) {
    errorMessage.value = "Barcode detection is not available";
    return;
  }

  errorMessage.value = "";

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

    isScannerActive.value = true;
    startDetection();
  } catch (error) {
    console.error("Error accessing camera:", error);
    errorMessage.value = "Could not access camera";
  }
};

// Stop video stream and detection
const stopScanner = () => {
  if (detectionInterval.value) {
    clearInterval(detectionInterval.value);
    detectionInterval.value = null;
  }

  isScannerActive.value = false;
};

// Start the detection process
const startDetection = async () => {
  if (!barcodeDetector.value || !videoElement.value) {
    return;
  }

  try {
    const imageBitmap = await createImageBitmap(videoElement.value);

    const barcodes = await barcodeDetector.value.detect(imageBitmap);
    barcodes.forEach((barcode) => {
      emit("result", barcode.rawValue);
      console.log("Найден штрих-код:", barcode.rawValue);
    });
  } catch (error) {
    errorText.value = error;
    console.error("Ошибка при распознавании штрих-кода:", error);
  }
};

// Use the scanned value and emit it
const useScannedValue = () => {
  if (scannedValue.value) {
    // Also emit regular Vue event
    emit("value", scannedValue.value);
    handleClose();
  }
};
</script>

<style scoped>
@keyframes scanning {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
</style>
