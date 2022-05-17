<template>
  <component
    v-for="popup in popupStack"
    :key="popup.id"
    :is="popup.component"
    v-bind="popup.props"
    @close="closePopup(popup.id)"
  />
</template>

<script setup lang="ts">
import { usePopup } from "@/shared/popup";
const { popupStack, closePopup } = usePopup();
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
