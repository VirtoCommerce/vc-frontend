<template>
  <div
    :class="[
      'vc-layout',
      `vc-layout--sidebar-position--${sidebarPosition}`,
      { 'vc-layout--sticky-sidebar': stickySidebar },
    ]"
  >
    <div class="vc-layout__container">
      <!-- Sidebar first when on the left -->
      <aside v-if="$slots.sidebar && sidebarPosition === 'left'" class="vc-layout__sidebar-container">
        <div
          ref="sidebar"
          class="vc-layout__sidebar"
          :style="stickySidebar && !isMobile ? sidebarStyle : {}"
          data-test-id="sidebar"
        >
          <slot name="sidebar" />
        </div>
      </aside>

      <!-- Single content block -->
      <div class="vc-layout__content-container">
        <div ref="content" class="vc-layout__content" data-test-id="content">
          <slot />
        </div>
      </div>

      <!-- Sidebar last when on the right -->
      <aside v-if="$slots.sidebar && sidebarPosition === 'right'" class="vc-layout__sidebar-container">
        <div
          ref="sidebar"
          class="vc-layout__sidebar"
          :style="stickySidebar && !isMobile ? sidebarStyle : {}"
          data-test-id="sidebar"
        >
          <slot name="sidebar" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { ref } from "vue";
import { BREAKPOINTS } from "@/core/constants";
import { useStickySidebar } from "../../../composables/useStickySidebar";

interface IProps {
  sidebarPosition?: "left" | "right";
  stickySidebar?: boolean;
}

withDefaults(defineProps<IProps>(), {
  sidebarPosition: "left",
});

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = breakpoints.smaller("md");

const sidebar = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);

const { sidebarStyle } = useStickySidebar({
  content,
  sidebar,
});
</script>

<style lang="scss">
.vc-layout {
  $left: "";
  $right: "";
  $stickySidebar: "";

  //useStickySidebar requires "px"
  --sidebar-offset-top: var(--vc-layout-sidebar-offset-top);
  --sidebar-offset-bottom: var(--vc-layout-sidebar-offset-bottom, 20px);

  &--sidebar-position {
    &--left {
      $left: &;
    }

    &--right {
      $right: &;
    }
  }

  &--sticky-sidebar {
    $stickySidebar: &;
  }

  &__container {
    @apply flex flex-col max-w-full;

    @media (min-width: theme("screens.md")) {
      @apply flex-row items-stretch gap-3;
    }

    @media (min-width: theme("screens.xl")) {
      @apply gap-5;
    }
  }

  &__sidebar-container {
    @apply flex-none relative contents transition-[position] duration-300;

    @media (min-width: theme("screens.md")) {
      @apply flex items-start;
      overflow-anchor: none;
    }

    #{$left} & {
      @media (min-width: theme("screens.md")) {
        @apply w-52;
      }

      @media (min-width: theme("screens.xl")) {
        @apply w-60;
      }
    }

    #{$right} & {
      @media (min-width: theme("screens.md")) {
        @apply w-64;
      }

      @media (min-width: theme("screens.xl")) {
        @apply w-72;
      }
    }
  }

  &__sidebar {
    @apply contents;

    @media (min-width: theme("screens.md")) {
      @apply block;
    }

    & > * {
      @apply order-[2];
    }

    #{$stickySidebar} & {
      @media (min-width: theme("screens.md")) {
        @apply sticky top-[--sidebar-offset-top] bottom-[--sidebar-offset-bottom];
      }
    }

    #{$left} & {
      @media (min-width: theme("screens.md")) {
        @apply w-52;
      }

      @media (min-width: theme("screens.xl")) {
        @apply w-60;
      }
    }

    #{$right} & {
      @media (min-width: theme("screens.md")) {
        @apply w-64;
      }

      @media (min-width: theme("screens.xl")) {
        @apply w-72;
      }
    }
  }

  &__content-container {
    @apply contents;

    @media (min-width: theme("screens.md")) {
      @apply block w-0 flex-grow;
    }
  }

  &__content {
    @apply contents;

    @media (min-width: theme("screens.md")) {
      @apply block;
    }

    & > * {
      @apply order-[1];
    }
  }
}
</style>
