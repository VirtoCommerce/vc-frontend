<template>
  <component
    :is="popup.component"
    v-for="popup in popupStack"
    :key="popup.id"
    v-bind="popup.props"
    @close="closePopup(popup.id)"
  />
</template>

<script setup lang="ts">
import { usePopup } from "../composables";

defineOptions({
  inheritAttrs: false,
});

const { popupStack, closePopup } = usePopup();
</script>
