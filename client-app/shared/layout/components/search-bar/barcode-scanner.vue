<template>
  <div v-if="isMobile">
    <input id="image-search" class="hidden" type="file" />
    <label for="image-search" aria-label="image search">
      <VcIcon name="barcode" class="mobile-icon" />
    </label>
  </div>
  <VcButton
    v-else
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
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useModal } from "@/shared/modal";
import BarcodeScannerModal from "./barcode-scanner-modal.vue";
const emit = defineEmits<IEmits>();

const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smaller("md");

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

.mobile-icon {
  @apply h-full m-2 text-[--base-color];
}
</style>
