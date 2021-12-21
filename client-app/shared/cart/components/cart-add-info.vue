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
              class="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-bold leading-6 text-white h-14 flex items-center px-5"
                :class="[lineItem.quantity === 0 ? 'bg-yellow-500' : 'bg-green-500']"
              >
                <span v-if="lineItem.quantity === 0" class="flex-grow">1 Product removed from cart</span>
                <span v-else class="flex-grow">1 Product added to cart</span>
                <i class="fas fa-times text-2xl cursor-pointer" @click="$emit('close')"></i>
              </DialogTitle>

              <div class="hidden lg:block">
                <table class="w-full">
                  <thead class="border-b border-gray-200">
                    <tr>
                      <th class="px-5 py-3 text-sm font-bold">Product</th>
                      <th class="px-5 py-3 text-sm font-bold text-center">Quantity</th>
                      <th class="px-5 py-3 text-sm font-bold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody class="border-b border-gray-200">
                    <tr>
                      <td class="px-5 py-3">
                        <div class="flex items-center">
                          <img
                            class="border object-contain rounded-sm"
                            :src="lineItem.imageUrl || '/static/images/common/no-image.svg'"
                            width="72"
                            height="72"
                          />
                          <div class="ml-4 font-bold text-blue-700">{{ lineItem.name }}</div>
                        </div>
                      </td>
                      <td class="px-5 py-3 text-center">{{ lineItem.quantity }}</td>
                      <td class="px-5 py-3 text-right text-green-700 font-bold">
                        {{ lineItem.extendedPrice?.formattedAmount }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="block lg:hidden">
                <div class="flex items-center border-b border-gray-200 p-5">
                  <img
                    class="border object-contain rounded-sm"
                    :src="lineItem.imageUrl || '/static/images/common/no-image.svg'"
                    width="72"
                    height="72"
                  />
                  <div class="ml-4 font-bold text-blue-700">{{ lineItem.name }}</div>
                </div>

                <div class="flex items-center justify-between px-5 py-3">
                  <div>
                    Quantity: <span class="font-bold">{{ lineItem.quantity }}</span>
                  </div>
                  <div>
                    Total: <span class="font-bold text-green-700">{{ lineItem.extendedPrice?.formattedAmount }}</span>
                  </div>
                </div>
              </div>

              <div class="px-5 py-4 flex items-center justify-between lg:justify-end space-x-4">
                <button
                  class="uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-4 h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded focus:outline-none"
                  @click="$emit('close')"
                >
                  Continue shopping
                </button>
                <router-link
                  to="/checkout"
                  class="uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-4 h-9 font-roboto-condensed text-base font-bold rounded bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none"
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
import { PropType } from "vue";
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle } from "@headlessui/vue";
import { LineItemType } from "@/core/api/graphql/types";

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },

  lineItem: {
    type: Object as PropType<LineItemType>,
    required: true,
  },
});

defineEmits(["close"]);
</script>
