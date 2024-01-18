<template>
  <teleport to="body">
    <!-- Sidebar back cover -->
    <transition name="fade">
      <div v-if="isVisible" class="fixed inset-0 z-50 size-full bg-gray-900/30" @click="onHide" />
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
        class="fixed inset-0 z-50 flex w-72 flex-col bg-[--color-additional-50] transition-transform"
      >
        <div class="relative z-[1] flex items-center justify-between gap-2 ps-5 shadow-sm">
          <slot name="header" :hide="onHide">
            <div class="text-2xl font-bold">
              {{ $t("common.buttons.filters") }}
            </div>

            <button type="button" class="appearance-none px-5 py-4" @click="onHide">
              <VcIcon class="text-[--color-danger-400]" name="x" />
            </button>
          </slot>
        </div>

        <div class="grow overflow-y-auto p-5">
          <slot />
        </div>

        <div class="relative z-[1] flex flex-wrap gap-4 px-5 py-4 shadow-2xl [&>*]:flex-1">
          <slot name="footer" />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { syncRefs, useScrollLock } from "@vueuse/core";
import { toRefs } from "vue";

interface IEmits {
  (event: "hide"): void;
}

interface IProps {
  isVisible?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { isVisible } = toRefs(props);

syncRefs(isVisible, useScrollLock(document.body));

function onHide() {
  emit("hide");
}
</script>
