<template>
  <div class="vc-layout">
    <div class="vc-layout__container">
      <aside
        v-if="$slots.sidebar"
        :class="['vc-layout__sidebar-container', `vc-layout__sidebar-container--position--${sidebarPosition}`]"
      >
        <div
          ref="sidebar"
          :class="[
            'vc-layout__sidebar',
            {
              'vc-layout__sidebar--sticky': stickySidebar,
            },
          ]"
          :style="stickySidebar ? sidebarStyle : {}"
        >
          <slot name="sidebar" />
        </div>
      </aside>

      <main class="vc-layout__content-container">
        <div ref="content" class="vc-layout__content">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStickySidebar } from "../../../composables/useStickySidebar";

interface IProps {
  sidebarPosition?: "left" | "right";
  stickySidebar?: boolean;
}

withDefaults(defineProps<IProps>(), {
  sidebarPosition: "left",
});

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

  //useStickySidebar requires "px"
  --sidebar-offset-top: var(--vc-layout-sidebar-offset-top, 68px);
  --sidebar-offset-bottom: var(--vc-layout-sidebar-offset-bottom, 20px);

  @media (min-width: theme("screens.lg")) {
    --sidebar-offset-top: var(--vc-layout-sidebar-offset-top, 108px);
  }

  &__container {
    @apply max-w-full;

    @media (min-width: theme("screens.md")) {
      @apply flex items-stretch gap-3;
    }

    @media (min-width: theme("screens.xl")) {
      @apply gap-5;
    }
  }

  &__sidebar-container {
    @apply flex-none relative contents transition-[position] duration-300;

    @media (min-width: theme("screens.md")) {
      @apply flex items-start;
    }

    &--position {
      &--left {
        $left: &;

        @media (min-width: theme("screens.md")) {
          @apply order-first w-52;
        }

        @media (min-width: theme("screens.xl")) {
          @apply w-60;
        }
      }

      &--right {
        $right: &;

        @media (min-width: theme("screens.md")) {
          @apply order-last w-64;
        }

        @media (min-width: theme("screens.xl")) {
          @apply w-72;
        }
      }
    }
  }

  &__sidebar {
    &--sticky {
      @media (max-width: theme("screens.md")) {
        @apply relative top-auto bottom-auto #{!important};
      }

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
      @apply block order-2 w-0 flex-grow;
    }
  }
}
</style>
