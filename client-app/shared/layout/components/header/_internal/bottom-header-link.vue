<template>
  <router-link v-slot="{ isActive, href, navigate }" :to="link.route ?? ''" custom :tabindex="link.route ? 0 : undefined">
    <component
      :is="link.route ? 'a' : 'button'"
      v-bind="$attrs"
      :href="href"
      :class="[
        isActive && link.route
          ? 'text-[--header-bottom-link-active-color]'
          : 'text-[--header-bottom-link-color] hover:text-[--header-bottom-link-hover-color]',
      ]"
      class="flex flex-col items-center gap-0.5 px-3 text-xs tracking-wide"
      @click="link.route ? navigate : undefined"
    >
      <span class="relative">
        <slot name="icon">
          <VcIcon v-if="link.icon" :name="link.icon" :size="24" class="mb-0.5 fill-primary" />
        </slot>

        <transition mode="out-in" name="scale">
          <VcBadge
            v-if="count"
            class="absolute -right-3 -top-2 transition-transform"
            variant="outline"
            rounded
            nowrap
            size="sm"
            max-width="none"
          >
            {{ $n(count, { style: "decimal", notation: "compact" }) }}
          </VcBadge>
        </transition>
      </span>

      <span>
        <slot />
      </span>
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
