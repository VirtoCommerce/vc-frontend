<template>
  <div class="vc-layout-with-right-sidebar">
    <!-- Main section -->
    <div class="vc-layout-with-right-sidebar__main">
      <slot />
    </div>

    <!-- Sidebar -->
    <div
      class="vc-layout-with-right-sidebar__sidebar"
      :class="{ 'vc-layout-with-right-sidebar__sidebar--sticky': isSidebarSticky }"
    >
      <slot name="sidebar" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isSidebarSticky: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss">
.vc-layout-with-right-sidebar {
  @apply flex flex-col;

  @screen lg {
    @apply flex-row items-start gap-x-6;
  }

  &__main {
    @apply contents min-w-0;

    @screen lg {
      @apply grow block space-y-6;
    }
  }

  &__sidebar {
    @apply contents;

    @screen lg {
      @apply block shrink-0 space-y-6 w-1/4;
    }

    @screen 2xl {
      @apply w-[285px];
    }

    &--sticky {
      @screen lg {
        @apply sticky top-[6.5rem];
      }
    }
  }
}
</style>
