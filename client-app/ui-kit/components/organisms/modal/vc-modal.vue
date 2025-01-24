<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog
      as="div"
      :class="[
        'vc-modal',
        {
          'vc-modal--mobile-fullscreen': isMobileFullscreen,
        },
      ]"
      :initial-focus="getActiveElement()"
      @close="!isPersistent && close()"
    >
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="vc-modal__backdrop" />
      </TransitionChild>

      <div class="vc-modal__wrapper">
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
          <DialogPanel class="vc-modal__dialog" :style="{ maxWidth }">
            <VcDialog :dividers="dividers" :is-mobile-fullscreen="isMobileFullscreen">
              <DialogTitle>
                <VcDialogHeader :icon="icon" :color="variant" :closable="!isPersistent" @close="close">
                  <slot name="title">
                    {{ title }}
                  </slot>
                </VcDialogHeader>
              </DialogTitle>

              <VcDialogContent>
                <slot :close="close" />
              </VcDialogContent>

              <VcDialogFooter v-if="!hideActions" @close="close">
                <slot name="actions" :close="close" />
              </VcDialogFooter>
            </VcDialog>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { ref, watchSyncEffect } from "vue";

interface IEmits {
  (event: "close"): void;
}

interface IProps {
  show?: boolean;
  hideActions?: boolean;
  isPersistent?: boolean;
  isMobileFullscreen?: boolean;
  title?: string;
  icon?: string;
  maxWidth?: string;
  variant?: "primary" | "secondary" | "info" | "success" | "warning" | "danger" | "neutral" | "accent";
  dividers?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  show: true,
  variant: "info",
  maxWidth: "35.25rem",
});

const isOpen = ref(true);

function close() {
  isOpen.value = false;
}

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

<style lang="scss">
.vc-modal {
  $mobileFullscreen: "";

  @apply fixed top-0 left-0 w-full h-full z-50;

  &--mobile-fullscreen {
    $mobileFullscreen: &;
  }

  &__backdrop {
    @apply fixed inset-0 bg-neutral-900/30 w-full h-full transition-all;
  }

  &__wrapper {
    @apply relative z-50 flex items-center justify-center w-full h-full px-4 py-8;

    #{$mobileFullscreen} & {
      @media (max-width: theme("screens.md")) {
        @apply p-0;
      }
    }
  }

  &__dialog {
    @apply flex items-center justify-center w-full h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)];

    #{$mobileFullscreen} & {
      @media (max-width: theme("screens.md")) {
        @apply h-full max-h-full max-w-full #{!important};

        & > .vc-dialog {
          @apply max-h-full h-full p-0 rounded-none;
        }
      }
    }
  }
}
</style>
