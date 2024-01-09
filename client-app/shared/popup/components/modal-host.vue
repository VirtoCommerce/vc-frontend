<template>
  <component
    :is="popup.component"
    v-for="popup in popupStack"
    :key="popup.id"
    v-bind="popup.props"
    @close="closeModal(popup.id)"
  />
</template>

<script setup lang="ts">
import { useModal } from "../composables";

defineOptions({
  inheritAttrs: false,
});

const { popupStack, closeModal } = useModal();
</script>
