<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div">
      <div class="fixed inset-0 z-10 overflow-y-auto">
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
              class="inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-bold leading-6 text-white bg-green-500 h-14 flex items-center px-5"
              >
                <span class="flex-grow">1 Product added to cart</span>
                <i class="fas fa-times text-2xl cursor-pointer" @click="$emit('close')"></i>
              </DialogTitle>

              <div class="">Table</div>

              <div
                class="mt-4 border-t border-gray-200 px-5 py-4 flex items-center justify-between lg:justify-end space-x-4"
              >
                <button
                  class="w-1/2 lg:w-auto inline-flex items-center justify-center lg:px-4 h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded focus:outline-none"
                  @click="$emit('close')"
                >
                  Continue shopping
                </button>
                <router-link
                  to="/cart"
                  class="w-1/2 lg:w-auto inline-flex items-center justify-center lg:px-4 h-9 font-roboto-condensed text-base font-bold rounded bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none"
                  >View cart</router-link
                >
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

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },

  lineItem: {
    type: Object,
    required: true,
  },
});

defineEmits(["close"]);
</script>
