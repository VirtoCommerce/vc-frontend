<template>
  <router-link :to="to" custom v-slot="{ isActive, href, navigate }">
    <a
      v-bind="$attrs"
      :href="href"
      :class="{
        'text-[color:var(--color-header-bottom-link-hover)]': isActive,
      }"
      class="flex flex-col items-center px-3 font-semibold tracking-wide text-13 text-[color:var(--color-header-bottom-link)] hover:text-[color:var(--color-header-bottom-link-hover)]"
      @click="navigate"
    >
      <span class="relative">
        <svg v-if="icon" height="24" width="24" class="mb-1 text-[color:var(--color-primary)]">
          <use :href="icon" />
        </svg>

        <transition
          enter-from-class="scale-0"
          leave-to-class="scale-0"
          enter-active-class="will-change-transform"
          leave-active-class="will-change-transform"
        >
          <span
            v-if="count"
            class="absolute -top-2 -right-3 transition-transform bg-white rounded-full border border-[color:var(--color-primary)] px-1.5 py-0.5 font-extrabold text-11 leading-3 text-[color:var(--color-header-bottom-link)]"
          >
            {{ preparedCount }}
          </span>
        </transition>
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
import { RouteLocationRaw } from "vue-router";
import { numberToShortString } from "@/core/utilities";

const props = defineProps({
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: undefined,
  },

  icon: {
    type: String,
    default: "",
  },

  count: {
    type: Number,
    default: 0,
  },
});

const preparedCount = computed<string>(() => numberToShortString(props.count));
</script>
