<template>
  <teleport to="body">
    <transition-group name="app-notifications" tag="div" class="notifications">
      <div
        v-for="notification in stack"
        :key="notification.id"
        :class="[
          'notifications-host__item',
          `notifications-host__item--${notification.type}`,
          notification.closeButton ? 'pl-5 pr-12 md:pl-12' : 'px-5 md:px-12',
          notification.classes,
        ]"
      >
        <!-- Content -->
        <div>
          <component :is="notification.component" v-if="notification.component" v-bind="notification.props" />
          <span v-else-if="notification.html" v-html-safe="notification.html" />
          <span v-else-if="notification.text" v-text="notification.text" />
        </div>

        <!-- Custom button -->
        <component
          :is="notification.button.to ? 'router-link' : 'button'"
          v-if="notification.button"
          :to="notification.button.to"
          :class="['notifications-host__button', notification.button.classes]"
          @click="notification.button?.clickHandler ? notification.button.clickHandler(notification.id!, $event) : null"
        >
          <span v-if="notification.button.html" v-html-safe="notification.button.html" />
          <span v-else-if="notification.button.text" v-text="notification.button.text" />
        </component>

        <!-- Close button -->
        <button
          v-if="notification.closeButton"
          type="button"
          class="notifications-host__close-button"
          @click="close(notification.id!)"
        >
          <VcIcon name="x" />
        </button>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup lang="ts">
import { useNotifications } from "../composables";

defineOptions({
  inheritAttrs: false,
});

const { stack, close } = useNotifications();
</script>

<style lang="scss">
$status-colors: success, warning, danger;

.notifications-host {
  $self: &;

  position: fixed;
  isolation: isolate;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5000;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);

  &__item {
    @apply relative flex flex-row gap-3 items-center justify-center w-full min-h-[3.5rem] lg:min-h-[3rem]
     py-2 shadow-inner leading-tight;

    --tw-shadow: inset 0 -1px 0px 0 rgb(0 0 0 / 0.08);

    z-index: 5000;

    &--info {
      @apply bg-white;

      text-shadow: none;

      #{$self}__close-button {
        text-shadow: none;
      }
    }

    @each $status in $status-colors {
      &--#{$status} {
        @apply bg-[color:var(--color-#{$status})] text-white;
      }
    }
  }

  &__button {
    @apply h-[25px] inline-flex items-center justify-center appearance-none bg-white text-gray-800
    uppercase text-xs font-bold px-3.5 shadow rounded font-roboto-condensed;

    --tw-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);

    text-shadow: none;
  }

  &__close-button {
    @apply absolute right-0 appearance-none px-4 py-2;

    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
  }
}

.app-notifications-move,
.app-notifications-enter-active,
.app-notifications-leave-active {
  transition: transform 0.25s ease-in-out;
  will-change: transform;
  z-index: 4999;
}

.app-notifications-leave-active {
  position: absolute;
}

.app-notifications-enter-from,
.app-notifications-leave-to {
  transform: translateY(-100%);
}
</style>
