<template>
  <div :id="model.id" class="empty-block-for-scroll-to"></div>
</template>

<script setup lang="ts">
interface IProps {
  model: {
    id: string;
  };
}

defineProps<IProps>();
</script>

<style lang="scss" scoped>
.empty-block-for-scroll-to {
  margin: 0 !important;
  padding: 0 !important;
  height: 0 !important;
  font-size: 0 !important;
  line-height: 0 !important;
}
</style>
