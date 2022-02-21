<template>
  <TransitionRoot appear :show="show" as="template" @after-leave.once="$emit('close')">
    <Dialog as="div" :initialFocus="getActiveElement()" @close="() => {}">
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="min-h-screen px-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <DialogOverlay class="fixed inset-0 bg-gray-900 bg-opacity-30" />
          </TransitionChild>

          <span class="inline-block h-screen align-middle" aria-hidden="true"> &#8203; </span>

          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <div
              class="inline-block w-full my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md"
              :class="modalWidth"
            >
              <!-- Title bar -->
              <DialogTitle
                as="h3"
                class="text-lg font-bold leading-6 text-white h-14 flex items-center px-5"
                :class="headerStyle"
              >
                <slot name="title">
                  <span class="flex-grow">{{ title }}</span>
                </slot>
                <i v-if="!isPersistent" class="fas fa-times text-2xl cursor-pointer" @click="onClose"></i>
              </DialogTitle>

              <!-- Dialog contents -->
              <div><slot :close="onClose"></slot></div>

              <!-- Dialog actions -->
              <div v-if="!hideActions" class="px-5 py-4 flex items-center justify-between lg:justify-end space-x-4">
                <slot name="actions" :close="onClose">
                  <button
                    class="uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-4 h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded focus:outline-none"
                    @click="onClose"
                  >
                    Close
                  </button>
                </slot>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle } from "@headlessui/vue";
import { computed, ref } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: undefined,
  },

  variant: {
    type: String,
    default: "info",
  },

  loading: {
    type: Boolean,
    default: false,
  },

  isPersistent: {
    type: Boolean,
    default: false,
  },

  modalWidth: {
    type: String,
    default: "max-w-2xl",
  },

  hideActions: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);

const show = ref(!props.loading);

function onClose() {
  show.value = false;
}

const headerStyle = computed(() => {
  switch (props.variant) {
    case "warn":
      return "bg-yellow-500";
    case "danger":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    default:
      return "bg-gray-900";
  }
});

/**
 * Fixes issue with maximum call stack upon multiple popups opening.
 * See: https://github.com/tailwindlabs/headlessui/issues/825#issuecomment-962071295
 */
function getActiveElement() {
  return document.activeElement as HTMLElement;
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
