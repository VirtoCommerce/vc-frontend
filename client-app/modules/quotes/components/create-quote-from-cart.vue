<template>
  <VcWidget>
    Test
    <VcButton @click="onClick">Lock</VcButton>
  </VcWidget>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "lockCart"): void;
  (event: "unlockCart"): void;
}

const emit = defineEmits<IEmits>();

function onClick() {
  emit("lockCart");

  setTimeout(() => {
    emit("unlockCart");
  }, 2000);
}
</script>

<style scoped lang="scss"></style>
