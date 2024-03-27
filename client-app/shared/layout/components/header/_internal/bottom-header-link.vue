<template>
  <router-link v-slot="{ isActive, href, navigate }" :to="link.route ?? ''" custom>
    <a
      v-bind="$attrs"
      :href="href"
      :class="{
        'text-[color:var(--color-header-bottom-link-hover)]': isActive,
      }"
      class="flex flex-col items-center px-3 text-13 font-semibold tracking-wide text-[color:var(--color-header-bottom-link)] hover:text-[color:var(--color-header-bottom-link-hover)]"
      @click="navigate"
    >
      <span class="relative">
        <slot name="icon">
          <svg v-if="link.icon" height="24" width="24" class="mb-0.5 text-[color:var(--color-primary)]">
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
