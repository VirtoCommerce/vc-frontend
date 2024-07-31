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
          :max-width="notification.maxWidth"
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
  @apply z-[5000] fixed top-5 left-3 right-3 flex flex-col items-center h-0;

  &__wrapper {
    @apply flex flex-col items-center gap-2 empty:hidden;
  }

  &__buttons {
    @apply mt-2;
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
