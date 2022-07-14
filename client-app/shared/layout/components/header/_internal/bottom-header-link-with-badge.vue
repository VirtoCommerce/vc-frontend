<template>
  <router-link :to="to">
    <div
      class="flex flex-col items-center font-semibold hover:text-[color:var(--color-header-bottom-link-hover)] tracking-wide text-center text-13"
      :class="[
        {
          'text-[color:var(--color-header-bottom-link)]': !isActive,
          'text-[color:var(--color-header-bottom-link-hover)]': isActive,
        },
      ]"
    >
      <div class="relative">
        <svg
          v-if="icon"
          height="26"
          width="26"
          class="mb-[0.35rem]"
          :class="['shrink-0', { 'text-[color:var(--color-primary)]': !isActive }]"
          name="icon"
        >
          <use :href="icon"></use>
        </svg>
        <div
          v-if="count"
          class="absolute -top-2 -right-[1.375rem] rounded-xl bg-white border border-[color:var(--color-primary)] px-1.5 pt-px pb-0.5 font-bold text-11"
        >
          {{ count }}
        </div>
      </div>
      <slot>{{ title }}</slot>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { PropType, ref, shallowRef } from "vue";
import { onClickOutside } from "@vueuse/core";
import { MenuLink } from "@/shared/layout";
import { RouteLocationRaw } from "vue-router";

defineProps({
  title: {
    type: String,
    default: "",
  },

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
    default: null,
  },
});
</script>
