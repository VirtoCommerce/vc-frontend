<template>
  <VcModal is-mobile-fullscreen>
    <StreamQrcodeBarcodeReader @result="onResult"> </StreamQrcodeBarcodeReader>
  </VcModal>
</template>

<script setup lang="ts">
import { StreamQrcodeBarcodeReader } from "vue3-barcode-qrcode-reader";
import type { Result } from "vue3-barcode-qrcode-reader";

function onResult(data?: Result): void {
  console.log(data);
}
</script>
