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
import { useModal } from "@/shared/modal";
import BarcodeScannerModal from "./barcode-scanner-modal.vue";

interface IEmits {
  (e: "scannedCode", code: string): void;
}
const emit = defineEmits<IEmits>();

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
