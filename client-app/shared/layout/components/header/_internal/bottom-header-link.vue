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

        <!-- Badge -->
        <VcTransitionScale mode="out-in">
          <span
            v-if="count"
            class="absolute -top-2 -right-3 rounded-full border border-[color:var(--color-primary)] bg-white px-1.5 py-0.5 text-11 font-extrabold leading-3 text-[color:var(--color-header-bottom-link)] transition-transform"
          >
            {{ preparedCount }}
          </span>
        </VcTransitionScale>
      </span>

      <span>
        <slot />
      </span>
    </a>
  </router-link>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { numberToShortString, MenuLinkType } from "@/core";

const props = defineProps({
  link: {
    type: Object as PropType<MenuLinkType>,
    required: true,
  },

  count: {
    type: Number,
    default: 0,
  },
});

const preparedCount = computed<string>(() => numberToShortString(props.count));
</script>
