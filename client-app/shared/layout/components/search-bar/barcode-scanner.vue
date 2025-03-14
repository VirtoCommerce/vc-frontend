<template>
  <div>
    <VcButton icon="barcode" @click="openBarcodeScanner" />
  </div>
</template>

<script setup lang="ts">
import { useModal } from "@/shared/modal";
import BarcodeScannerModal from "./barcode-scanner-modal.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import { useNotifications } from "@/shared/notification";

// Define emits
const emit = defineEmits<{
  (e: "value", value: string): void;
}>();

const { openModal, closeModal } = useModal();
const notifications = useNotifications();

// Handler for when barcode value is received
const onBarcodeValueReceived = (value: string) => {
  console.log(value);
  notifications.success({ text: value })
  emit("value", value);
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
