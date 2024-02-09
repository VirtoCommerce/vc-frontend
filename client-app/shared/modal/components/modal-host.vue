<template>
  <component
    :is="modal.component"
    v-for="modal in modalStack"
    :key="modal.id"
    v-bind="modal.props"
    @close="closeModal(modal.id)"
  />
</template>

<script setup lang="ts">
import { useModal } from "../composables";

defineOptions({
  inheritAttrs: false,
});

const { modalStack, closeModal } = useModal();
</script>
