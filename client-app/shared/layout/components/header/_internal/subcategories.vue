<template>
  <Transition name="subcategories--slide">
    <VcScrollbar
      v-if="item && item.childCategories?.length"
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
          v-for="(child, index) in item.childCategories"
          :id="`subcategory-${child.id}`"
          :key="child.id"
          class="subcategories__item"
          size="sm"
          color="secondary"
          max-lines="2"
          role="menuitem"
          :to="routes[child.id]"
          :active="child.isActive"
          @keyup.arrow-right="focusMenuItem(child.childCategories[0].id)"
          @keyup.arrow-left="focusMenuItem(item.id)"
          @keyup.arrow-up="focusMenuItem(item.childCategories[index - 1].id)"
          @keyup.arrow-down="focusMenuItem(item.childCategories[index + 1].id)"
          @click="$emit('close')"
          @focusin="showChildren(child)"
          @mouseover="showChildren(child)"
        >
          {{ child.name }}

          <template v-if="child.childCategories?.length" #append>
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
    :aria-label="$t('shared.layout.header.mega_menu.aria_labels.subcategories', { category: activeItem.name })"
    @close="$emit('close')"
  />
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { useCategoriesRoutes } from "@/core/composables";
import type { IMarkedCategory } from "@/core/types";

interface IEmits {
  (e: "close"): void;
}

interface IProps {
  item: IMarkedCategory;
  onCancelHide?: () => void;
  onScheduleHide?: () => void;
  ariaLabel?: string;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();

const activeItem = ref<IMarkedCategory | null>(null);
let timeout: ReturnType<typeof setTimeout> | null = null;
let switchTimeout: ReturnType<typeof setTimeout> | null = null;

const items = computed(() => props.item.childCategories || []);
const routes = useCategoriesRoutes(items);

function showChildren(item: IMarkedCategory) {
  cancelHide();

  if (switchTimeout) {
    clearTimeout(switchTimeout);
  }

  if (activeItem.value?.id === item.id) {
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
  @apply relative me-2.5 w-[15rem] max-h-[100%-2.5rem];

  @media (min-width: theme("screens.2xl")) {
    @apply w-[21.5rem];
  }

  &:not(:first-child) {
    @apply ps-2.5 border-l border-secondary-200;
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
      @apply w-[20.875rem];
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
