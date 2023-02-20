<template>
  <component
    :is="popup.component"
    v-for="popup in popupStack"
    :key="popup.id"
    v-bind="popup.props"
    @close="closePopup(popup.id)"
  />
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { usePopup } from "@/shared/popup";
const { popupStack, closePopup } = usePopup();
</script>
