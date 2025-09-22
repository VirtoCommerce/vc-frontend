<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog
      as="div"
      :class="[
        'vc-modal',
        {
          'vc-modal--mobile-fullscreen': isMobileFullscreen,
          'vc-modal--full-height': isFullHeight,
        },
        $attrs.class,
      ]"
      :initial-focus="getActiveElement()"
      :data-test-id="testId"
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
            <VcDialog :dividers="dividers">
              <VcDialogHeader :icon="icon" :color="variant" :closable="!isPersistent" @close="close">
                <DialogTitle>
                  <slot name="title">
                    {{ title }}
                  </slot>
                </DialogTitle>
              </VcDialogHeader>

              <DialogDescription>
                <VcDialogContent>
                  <slot :close="close" />
                </VcDialogContent>
              </DialogDescription>

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
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle, DialogDescription } from "@headlessui/vue";
import { ref, watchSyncEffect } from "vue";

interface IEmits {
  (event: "close"): void;
}

interface IProps {
  show?: boolean;
  hideActions?: boolean;
  isPersistent?: boolean;
  isMobileFullscreen?: boolean;
  isFullHeight?: boolean;
  title?: string;
  icon?: string;
  maxWidth?: string;
  variant?: "primary" | "secondary" | "info" | "success" | "warning" | "danger" | "neutral" | "accent";
  dividers?: boolean;
  testId?: string;
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
  $fullHeight: "";

  @apply fixed top-0 left-0 w-full h-full z-50;

  &--mobile-fullscreen {
    $mobileFullscreen: &;
  }

  &--full-height {
    $fullHeight: &;
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

        & > .vc-dialog,
        & > .vc-dialog .vc-dialog-content__container {
          @apply max-h-full h-full rounded-none;
        }
      }
    }

    #{$fullHeight} & {
      & > .vc-dialog,
      & > .vc-dialog .vc-dialog-content__container {
        @media (min-width: theme("screens.md")) {
          @apply max-h-full h-full;
        }
      }
    }
  }
}
</style>
