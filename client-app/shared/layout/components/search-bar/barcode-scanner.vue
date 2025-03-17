<template>
  <div>
    <VcButton icon="barcode" @click="openBarcodeScanner" />
  </div>
</template>

<script setup lang="ts">
import { useModal } from "@/shared/modal";
import BarcodeScannerModal from "./barcode-scanner-modal.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

// Define emits
const emit = defineEmits<{
  (e: "value", value: string): void;
}>();

const { openModal, closeModal } = useModal();

// Handler for when barcode value is received
const onBarcodeValueReceived = (value: string[]) => {
  emit("value", value.join(","));
  closeModal();
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
