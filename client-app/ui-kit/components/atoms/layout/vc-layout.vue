<template>
  <div :class="['vc-layout', `vc-layout--sidebar-position--${sidebarPosition}`, { 'vc-layout--sticky': sticky }]">
    <div ref="container" class="vc-layout__container">
      <!-- Sidebar first when on the left -->
      <aside
        v-if="$slots.sidebar && sidebarPosition === 'left'"
        class="vc-layout__sidebar-container"
        :aria-label="sidebarLabel"
      >
        <div ref="sidebar" class="vc-layout__sidebar" :style="sidebarStyle" data-test-id="sidebar">
          <slot name="sidebar" />
        </div>
      </aside>

      <!-- Single content block -->
      <div class="vc-layout__content-container">
        <div ref="content" class="vc-layout__content" :style="contentStyle" data-test-id="content">
          <slot />
        </div>
      </div>

      <!-- Sidebar last when on the right -->
      <aside
        v-if="$slots.sidebar && sidebarPosition === 'right'"
        class="vc-layout__sidebar-container"
        :aria-label="sidebarLabel"
      >
        <div ref="sidebar" class="vc-layout__sidebar" :style="sidebarStyle" data-test-id="sidebar">
          <slot name="sidebar" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints, useElementBounding } from "@vueuse/core";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { BREAKPOINTS } from "@/core/constants";
import { useSmartSticky } from "../../../composables/useSmartSticky";

interface IProps {
  sidebarPosition?: "left" | "right";
  sticky?: boolean;
  sidebarAriaLabel?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  sidebarPosition: "left",
});

const { t } = useI18n();

const breakpoints = useBreakpoints(BREAKPOINTS);
const isMobile = breakpoints.smaller("md");

const sidebarLabel = computed(() => props.sidebarAriaLabel || t("ui_kit.accessibility.sidebar"));

const container = ref<HTMLElement | null>(null);
const sidebar = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);

const { height: sidebarHeight } = useElementBounding(sidebar);
const { height: contentHeight } = useElementBounding(content);

const isStickyEnabled = computed(() => props.sticky && !isMobile.value);

const shouldStickSidebar = computed(() => isStickyEnabled.value && sidebarHeight.value <= contentHeight.value);
const shouldStickContent = computed(() => isStickyEnabled.value && contentHeight.value < sidebarHeight.value);

const stickyOptions = {
  container,
  topOffsetVar: "--sticky-offset-top",
  bottomOffsetVar: "--sticky-offset-bottom",
};

const { style: sidebarStyle } = useSmartSticky({
  ...stickyOptions,
  stickyElement: sidebar,
  enabled: shouldStickSidebar,
});

const { style: contentStyle } = useSmartSticky({
  ...stickyOptions,
  stickyElement: content,
  enabled: shouldStickContent,
});
</script>

<style lang="scss">
.vc-layout {
  $left: "";
  $right: "";
  $sticky: "";

  // useSmartSticky require "px"
  --sticky-offset-top: var(--vc-layout-sidebar-offset-top, 0px);
  --sticky-offset-bottom: var(--vc-layout-sidebar-offset-bottom, 20px);

  &--sidebar-position {
    &--left {
      $left: &;
    }

    &--right {
      $right: &;
    }
  }

  &--sticky {
    $sticky: &;
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
      @apply block transition-shadow duration-200;
    }

    & > * {
      @apply order-[2];
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
    @apply relative contents transition-[position] duration-300;

    @media (min-width: theme("screens.md")) {
      @apply flex items-start w-0 flex-grow;
      overflow-anchor: none;
    }
  }

  &__content {
    @apply contents;

    @media (min-width: theme("screens.md")) {
      @apply block w-full transition-shadow duration-200;
    }

    & > * {
      @apply order-[1];
    }
  }
}
</style>
