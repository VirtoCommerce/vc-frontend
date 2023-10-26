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
        <svg v-if="link.icon" height="24" width="24" class="mb-0.5 text-[color:var(--color-primary)]">
          <use :href="link.icon" />
        </svg>

        <VcTransitionScale mode="out-in">
          <VcBadge v-if="count" class="absolute -right-3 -top-2 transition-transform" variant="outline" rounded>
            {{ preparedCount }}
          </VcBadge>
        </VcTransitionScale>
      </span>

      <span>
        <slot />
      </span>
    </a>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { numberToShortString } from "@/core/utilities";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {
  link: ExtendedMenuLinkType;
  count?: number;
}

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<IProps>(), {
  count: 0,
});

const preparedCount = computed<string>(() => numberToShortString(props.count));
</script>
