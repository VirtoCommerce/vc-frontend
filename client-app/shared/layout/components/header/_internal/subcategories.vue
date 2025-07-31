<template>
  <Transition name="subcategories--slide">
    <VcScrollbar
      v-if="item && item.children?.length"
      class="subcategories"
      role="menubar"
      tabindex="-1"
      vertical
      :aria-label="ariaLabel"
      @onkeydown.enter="scheduleHide"
      @blur="scheduleHide"
      @mouseleave="scheduleHide"
      @focus="cancelHide"
      @mouseenter="cancelHide"
    >
      <ul class="subcategories__list" role="none">
        <VcMenuItem
          v-for="(child, index) in item.children"
          :id="child.id ? `subcategory-${child.id}` : null"
          :key="index"
          class="subcategories__item"
          size="sm"
          color="secondary"
          max-lines="2"
          role="menuitem"
          :to="child.route ?? '#'"
          :active="child.isActive"
          @keydown.arrow-right="child.children?.length && focusMenuItem(child.children[0].id)"
          @keydown.arrow-left="focusMenuItem(item.id)"
          @keydown.arrow-up.prevent="($event: KeyboardEvent) => focusPrevNextItem('UP', $event)"
          @keydown.arrow-down.prevent="($event: KeyboardEvent) => focusPrevNextItem('DOWN', $event)"
          @click="$emit('close')"
          @focusin="showChildren(child)"
          @mouseover="showChildren(child)"
        >
          <span :class="{ 'font-bold': child.type === 'pinned' }">
            {{ child.title }}
          </span>

          <template v-if="child.children?.length" #append>
            <VcIcon class="subcategories__arrow" name="chevron-right" />
          </template>
        </VcMenuItem>
      </ul>
    </VcScrollbar>
  </Transition>

  <Subcategories
    v-if="activeItem"
    :item="activeItem"
    :on-schedule-hide="scheduleHide"
    :on-cancel-hide="cancelHide"
    :aria-label="$t('shared.layout.header.mega_menu.aria_labels.subcategories', { category: activeItem.title })"
    @close="$emit('close')"
  />
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import type { MarkedMenuLinkType } from "@/core/types";

interface IEmits {
  (e: "close"): void;
}

interface IProps {
  item?: MarkedMenuLinkType;
  onCancelHide?: () => void;
  onScheduleHide?: () => void;
  ariaLabel?: string;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();

const activeItem = ref<MarkedMenuLinkType | null>(null);
let timeout: ReturnType<typeof setTimeout> | null = null;
let switchTimeout: ReturnType<typeof setTimeout> | null = null;

function showChildren(item?: MarkedMenuLinkType) {
  cancelHide();

  if (switchTimeout) {
    clearTimeout(switchTimeout);
  }

  if (!item || item.id && activeItem.value?.id === item.id) {
    return;
  }

  switchTimeout = setTimeout(() => {
    activeItem.value = item;
  }, 200);
}

function scheduleHide() {
  timeout = setTimeout(() => {
    activeItem.value = null;
  }, 300);

  props.onScheduleHide?.();
}

function cancelHide() {
  if (timeout) {
    clearTimeout(timeout);
  }

  if (switchTimeout) {
    clearTimeout(switchTimeout);
  }

  timeout = null;
  switchTimeout = null;

  props.onCancelHide?.();
}

function focusMenuItem(id?: string) {
  if (!id) {
    return;
  }

  const element = document.querySelector(`[id="subcategory-${id}"] > [role="menuitem"]`) as HTMLElement;

  if (element) {
    element.focus();
  }
}

function focusPrevNextItem(direction: "UP" | "DOWN", event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  const currentItem = target.parentElement as HTMLElement;
  const prev = currentItem.previousElementSibling?.childNodes[0] as HTMLElement | null;
  const next = currentItem.nextElementSibling?.childNodes[0] as HTMLElement | null;

  if (direction === "UP" && prev) {
    prev.focus();
  } else if (direction === "DOWN" && next) {
    next.focus();
  }
}

onBeforeUnmount(() => {
  if (timeout) {
    clearTimeout(timeout);
  }

  if (switchTimeout) {
    clearTimeout(switchTimeout);
  }
});
</script>

<style lang="scss">
.subcategories {
  @apply relative me-2.5 py-px w-[15rem] max-h-[calc(100%-2.5rem)];

  @media (min-width: theme("screens.2xl")) {
    @apply w-[21.5rem];
  }

  &:not(:first-child) {
    @apply ps-2.5 border-l border-secondary-200;

    @media (min-width: theme("screens.2xl")) {
      @apply w-[21.75rem];
    }
  }

  &--slide {
    &-enter-active,
    &-leave-active {
      @apply overflow-hidden;

      transition:
        width 0.3s ease,
        opacity 0.3s ease-in-out;

      & > * {
        @apply w-full;
      }
    }

    &-enter-from,
    &-leave-to {
      @apply me-0 w-0 opacity-0 overflow-hidden;
    }

    &-enter-to,
    &-leave-from {
      @apply me-2.5 max-w-full opacity-100 overflow-hidden;
    }
  }

  &__list {
    @apply flex-none w-[14.375rem];

    @media (min-width: theme("screens.2xl")) {
      @apply w-[20.5rem];
    }
  }

  &__arrow {
    @apply fill-secondary-400;
  }

  &__divider-container {
    @apply flex justify-center w-6 transition-all duration-300 ease-in-out;

    &:last-child {
      @apply w-0;
    }
  }
}
</style>
