<template>
  <teleport to="body">
    <div class="notifications-host">
      <transition-group name="app-notifications" tag="div" class="notifications-host__wrapper">
        <VcAlert
          v-for="notification in stack"
          :key="notification.id"
          class="notifications-host__item"
          :color="notification.type"
          :variant="notification.variant"
          icon
          :size="notification.size"
          shadow
          :closable="notification.closeButton"
          @close="close(notification.id!)"
        >
          <component :is="notification.component" v-if="notification.component" v-bind="notification.props" />
          <span v-else-if="notification.html" v-html-safe="notification.html" />
          <span v-else-if="notification.text" v-text="notification.text" />

          <div v-if="notification.button" class="notifications-host__buttons">
            <VcButton
              :to="notification.button.to"
              :color="notification.button.color ?? 'accent'"
              :variant="notification.button.variant ?? 'no-border'"
              class="notifications-host__button"
              size="xs"
              @click="
                notification.button?.clickHandler ? notification.button.clickHandler(notification.id!, $event) : null
              "
            >
              <span v-if="notification.button.html" v-html-safe="notification.button.html" />
              <span v-else-if="notification.button.text" v-text="notification.button.text" />
            </VcButton>
          </div>
        </VcAlert>
      </transition-group>
    </div>
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
.notifications-host {
  @apply z-[5000] overflow-y-auto fixed bottom-0 max-h-screen w-full empty:hidden;

  -ms-overflow-style: none; /* for Edge */
  scrollbar-width: none; /* for Firefox */

  &::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
  }

  @media (min-width: theme("screens.sm")) {
    @apply top-0 bottom-auto right-4 w-80 empty:hidden;
  }

  &__wrapper {
    @apply space-y-2 p-3;

    @media (min-width: theme("screens.sm")) {
      @apply space-y-3 pt-5 pb-0 px-0;
    }
  }

  &__item {
    @apply z-10 relative w-full;
  }

  &__buttons {
    @apply mt-2;
  }
}

.app-notifications-move,
.app-notifications-enter-active,
.app-notifications-leave-active {
  transition: transform 0.25s ease-in-out;
  z-index: 4999;
}

.app-notifications-leave-active {
  @apply absolute z-[5];
}

.app-notifications-enter-from,
.app-notifications-leave-to {
  transform: translateY(150%);

  @media (min-width: theme("screens.sm")) {
    transform: translateY(-150%);
  }
}
</style>
