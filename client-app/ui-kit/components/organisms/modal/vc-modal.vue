<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" :initial-focus="getActiveElement()" @close="() => {}">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <DialogOverlay class="fixed inset-0 z-50 bg-neutral-900 opacity-30" />
      </TransitionChild>

      <div
        class="fixed inset-0 z-50"
        :class="{
          'min-h-screen overflow-y-auto p-4 lg:p-8': !isMobileFullscreen,
          'h-screen sm:h-auto sm:min-h-screen sm:overflow-y-auto sm:p-4 lg:p-8': isMobileFullscreen,
        }"
      >
        <div class="flex min-h-full items-center justify-center">
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
              class="inline-block w-full overflow-hidden bg-additional-50 text-left transition-all sm:rounded-md sm:shadow-xl"
              :class="[
                modalWidth,
                isMobileFullscreen ? 'fixed inset-0 flex flex-col sm:static sm:inset-auto' : 'rounded-md shadow-xl',
              ]"
            >
              <!-- Title bar -->
              <DialogTitle
                as="h3"
                class="flex items-center px-6 py-3 text-lg font-black text-additional-50"
                :class="headerStyle"
              >
                <slot name="title">
                  <span class="grow">{{ title }}</span>
                </slot>

                <button v-if="!isPersistent" type="button" class="-my-3 -mr-4 px-4 py-2" @click="close">
                  <VcIcon name="x" size="md" />
                </button>
              </DialogTitle>

              <!-- Dialog contents -->
              <div :class="{ 'flex grow flex-col overflow-y-auto sm:overflow-y-visible': isMobileFullscreen }">
                <slot :close="close" />
              </div>

              <!-- Dialog actions -->
              <div
                v-if="!hideActions"
                class="flex flex-wrap items-center justify-center gap-4 px-6 py-4 [--vc-button-min-width:9rem] *:max-sm:flex-1 sm:justify-end"
              >
                <slot name="actions" :close="close">
                  <VcButton variant="outline" @click="close">
                    {{ $t("common.buttons.close") }}
                  </VcButton>
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

interface IEmits {
  (event: "close"): void;
}

interface IProps {
  show?: boolean;
  hideActions?: boolean;
  isPersistent?: boolean;
  isMobileFullscreen?: boolean;
  title?: string;
  modalWidth?: string;
  variant?: "info" | "success" | "warn" | "danger";
}

defineOptions({
  inheritAttrs: false,
});

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  show: true,
  variant: "info",
  modalWidth: "max-w-2xl",
});

const isOpen = ref(true);

function close() {
  isOpen.value = false;
}

const headerStyle = computed(() => {
  switch (props.variant) {
    case "warn":
      return "bg-warning";

    case "danger":
      return "bg-danger";

    case "success":
      return "bg-success";

    case "info":
    default:
      return "bg-neutral-900";
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

defineExpose({ close });
</script>
