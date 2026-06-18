<template>
  <VcButton
    class="barcode-scanner"
    color="primary"
    variant="no-border"
    size="xs"
    type="button"
    icon="barcode"
    @click.stop="openBarcodeScanner"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useModal } from "@/shared/modal";

// Loaded on first scan click so the barcode-detector ponyfill (~44 KB) stays out of the
// eager header bundle that ships on every page.
const BarcodeScannerModal = defineAsyncComponent(() => import("./barcode-scanner-modal.vue"));

const emit = defineEmits<IEmits>();

interface IEmits {
  (e: "scannedCode", code: string): void;
}
const { openModal, closeModal } = useModal();

const onBarcodeValueReceived = (codes: string[]) => {
  if (codes.length) {
    emit("scannedCode", codes[0]);
    closeModal();
  }
};

const openBarcodeScanner = () => {
  openModal({
    component: BarcodeScannerModal,
    props: {
      onClose: closeModal,
      onResult: onBarcodeValueReceived,
    },
  });
};
</script>

<style lang="scss">
.barcode-scanner {
  @apply m-1.5;
}
</style>
