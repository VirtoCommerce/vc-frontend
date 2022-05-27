<template>
  <TransitionRoot appear :show="isOpen" as="template">
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
            @after-leave="$emit('close')"
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

                <i v-if="!isPersistent" class="fas fa-times text-2xl cursor-pointer" @click="close"></i>
              </DialogTitle>

              <!-- Dialog contents -->
              <div>
                <slot :close="close" />
              </div>

              <!-- Dialog actions -->
              <div v-if="!hideActions" class="px-6 py-4 flex items-center justify-between lg:justify-end space-x-4">
                <slot name="actions" :close="close">
                  <button
                    class="uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-4 h-9 font-roboto-condensed text-base font-bold border-2 border-[color:var(--color-primary)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white rounded focus:outline-none"
                    @click="close"
                  >
                    {{ $t("common.buttons.close") }}
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
import { computed, ref, watchSyncEffect } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: undefined,
  },

  variant: {
    type: String,
    default: "info",
    validator: (value: string) => ["info", "success", "warn", "danger"].includes(value),
  },

  show: {
    type: Boolean,
    default: true,
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

const isOpen = ref(true);

function close() {
  isOpen.value = false;
}

const headerStyle = computed(() => {
  switch (props.variant) {
    case "warn":
      return "bg-[color:var(--color-primary)]";

    case "danger":
      return "bg-[color:var(--color-danger)]";

    case "success":
      return "bg-green-500";

    case "info":
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

watchSyncEffect(() => {
  isOpen.value = props.show;
});
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
