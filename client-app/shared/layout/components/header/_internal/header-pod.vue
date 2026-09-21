<template>
  <router-link
    v-slot="{ isActive, href, navigate }"
    :to="link.route ?? ''"
    custom
    :tabindex="link.route ? 0 : undefined"
  >
    <component
      :is="link.route ? 'a' : 'button'"
      v-bind="$attrs"
      :href="href"
      :class="['header-pod', { 'header-pod--active': isActive && link.route }]"
      :title="link.title"
      :aria-label="link.title"
      @click="(event: MouseEvent) => (link.route ? navigate(event) : undefined)"
    >
      <slot name="icon">
        <VcIcon v-if="link.icon" :name="link.icon" :size="20" />
      </slot>

      <transition mode="out-in" name="scale">
        <VcBadge v-if="count" class="header-pod__count" rounded nowrap size="sm" max-width="none">
          {{ $n(count, { style: "decimal", notation: "compact" }) }}
        </VcBadge>
      </transition>
    </component>
  </router-link>
</template>

<script setup lang="ts">
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {
  link: ExtendedMenuLinkType;
  count?: number;
}

defineOptions({
  inheritAttrs: false,
});

withDefaults(defineProps<IProps>(), {
  count: 0,
});
</script>

<style lang="scss">
.header-pod {
  --bg: color-mix(in srgb, var(--header-bottom-text-color) 6%, transparent);
  --bg-hover: color-mix(in srgb, var(--header-bottom-text-color) 12%, transparent);

  @apply relative grid size-[42px] flex-none cursor-pointer place-items-center rounded-full border-0;

  background: var(--bg);
  color: var(--header-bottom-link-color);
  transition:
    background var(--transition-duration) ease,
    color var(--transition-duration) ease;

  &:hover {
    background: var(--bg-hover);
    color: var(--header-bottom-link-hover-color);
  }

  &--active {
    color: var(--header-bottom-link-active-color);
  }

  &__count {
    @apply absolute -end-1 -top-1;
  }
}
</style>
