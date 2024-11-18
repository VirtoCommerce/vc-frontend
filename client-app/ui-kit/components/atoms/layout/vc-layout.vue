<template>
  <div class="vc-layout">
    <div class="vc-layout__container">
      <aside :class="['vc-layout__sidebar-container', `vc-layout__sidebar-container--position--${sidebarPosition}`]">
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
          <slot name="sidebar"></slot>
        </div>
      </aside>

      <main class="vc-layout__content-container">
        <div ref="content" class="vc-layout__content">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useStickySidebar } from "@/shared/catalog/composables/useStickyFilters";

interface IProps {
  sidebarPosition?: "left" | "right";
  stickySidebar?: boolean;
}

withDefaults(defineProps<IProps>(), {
  sidebarPosition: "left",
});

const sidebar = useTemplateRef("sidebar");
const content = useTemplateRef("content");

const { sidebarStyle } = useStickySidebar({
  content,
  sidebar,
});
</script>

<style lang="scss">
.vc-layout {
  $left: "";
  $right: "";

  --sidebar-offset-top: var(--vc-layout-sidebar-offset-top, theme("padding.5"));
  --sidebar-offset-bottom: var(--vc-layout-sidebar-offset-bottom, 0);

  &__container {
    @apply max-w-full;

    @media (min-width: theme("screens.md")) {
      @apply flex items-stretch gap-3;
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
      @media (min-width: theme("screens.md")) {
        //@apply sticky top-[--sidebar-offset-top];
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
