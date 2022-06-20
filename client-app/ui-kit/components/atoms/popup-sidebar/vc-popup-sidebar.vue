<template>
  <!-- sidebar back cover -->
  <div
    :class="{ hidden: !isVisible }"
    class="fixed z-50 inset-0 w-full h-full bg-gray-800 opacity-95"
    @click="onHide"
  />
  <!-- Sidebar content -->
  <div :class="{ hidden: !isVisible }" v-bind="$attrs" class="fixed z-50 inset-0 h-full overflow-y-auto bg-white">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { toRefs, watch } from "vue";
import { useDomUtils } from "@/core/composables";

const { toggleBodyScrollable } = useDomUtils();

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const { isVisible } = toRefs(props);

watch(isVisible, (value) => {
  toggleBodyScrollable(!value);
});

const emit = defineEmits(["hide"]);

function onHide() {
  emit("hide");
}
</script>
