<template>
  <router-link v-slot="{ isActive, href, navigate }" :to="link.route ?? ''" custom>
    <a
      v-bind="$attrs"
      :href="href"
      :class="[
        isActive && link.route
          ? 'text-[--header-bottom-link-active-color]'
          : 'text-[--header-bottom-link-color] hover:text-[--header-bottom-link-hover-color]',
      ]"
      class="flex flex-col items-center gap-0.5 px-3 text-sm font-bold tracking-wide"
      @click="navigate"
    >
      <span class="relative">
        <slot name="icon">
          <svg v-if="link.icon" height="24" width="24" class="mb-0.5 text-primary">
            <use :href="link.icon" />
          </svg>
        </slot>

        <transition mode="out-in" name="scale">
          <VcBadge v-if="count" class="absolute -right-3 -top-2 transition-transform" variant="outline" rounded>
            {{ $n(count, "decimal", { notation: "compact" }) }}
          </VcBadge>
        </transition>
      </span>

      <span>
        <slot />
      </span>
    </a>
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
