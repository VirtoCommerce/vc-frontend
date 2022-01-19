<template>
  <component
    :is="popup.component"
    v-for="(popup, i) in popupStack"
    :key="i"
    v-bind="popup.props"
    @close="closePopup(i)"
  ></component>
</template>

<script setup lang="ts">
import { usePopup } from "@/shared/popup";
const { popupStack, closePopup } = usePopup();
</script>
