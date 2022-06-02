<template>
  <!-- sidebar back cover -->
  <div
    :class="{ hidden: !visible }"
    class="fixed z-40 inset-0 w-full h-screen bg-gray-800 opacity-95"
    @click="onHide"
  />
  <!-- Sidebar content -->
  <div :class="{ hidden: !visible }" v-bind="$attrs" class="fixed z-50 inset-0 h-screen overflow-y-auto bg-white">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["hide"]);

function onHide() {
  emit("hide");
}
</script>
