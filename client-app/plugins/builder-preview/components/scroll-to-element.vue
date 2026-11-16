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
  margin: 0;
  padding: 0;
  height: 0;
  font-size: 0;
  line-height: 0;
}
</style>
