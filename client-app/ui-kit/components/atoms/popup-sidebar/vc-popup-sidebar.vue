<template>
  <teleport to="body">
    <!-- Sidebar back cover -->
    <transition name="fade">
      <div v-if="isVisible" class="fixed z-50 inset-0 w-full h-full bg-gray-900 bg-opacity-30" @click="onHide" />
    </transition>

    <!-- Sidebar content -->
    <transition
      enter-from-class="-translate-x-full"
      leave-to-class="-translate-x-full"
      enter-active-class="will-change-transform"
      leave-active-class="will-change-transform"
    >
      <div
        v-if="isVisible"
        v-bind="$attrs"
        class="fixed z-50 inset-0 flex flex-col overflow-y-auto bg-white transition-transform"
      >
        <slot />
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

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
