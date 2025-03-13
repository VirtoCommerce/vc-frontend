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
const onBarcodeValueReceived = (value: string) => {
  emit("value", value);
  closeModal();
};

const openBarcodeScanner = () => {
  openModal({
    component: BarcodeScannerModal,
    props: {
      onClose: closeModal,
    },
  });

  // Set up event listener for barcode value
  const modalElement = document.querySelector(".vc-modal-content");
  if (modalElement) {
    const handleBarcodeValue = (event: CustomEvent<string>) => {
      onBarcodeValueReceived(event.detail);
      modalElement.removeEventListener("value", handleBarcodeValue as EventListener);
    };

    modalElement.addEventListener("value", handleBarcodeValue as EventListener);
  }
};
</script>
