<template>
  <VcButton
    target="_blank"
    :size="size"
    prepend-icon="location-marker"
    external-link="https://maps.app.goo.gl/a758r8gHXft5Rt2V7"
    >Get directions</VcButton
  >
</template>

<script setup lang="ts">
type IProps = {
  size?: VcButtonSizeType;
};

withDefaults(defineProps<IProps>(), {
  size: "xs",
});
</script>
