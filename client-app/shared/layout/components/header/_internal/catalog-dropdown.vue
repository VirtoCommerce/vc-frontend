<template>
  <!-- Dropdown menu -->
  <div v-if="children?.length" ref="submenu" class="relative">
    <div
      class="flex items-center cursor-pointer px-[0.8rem] py-[0.55rem] border-2 border-primary rounded text-sm"
      @click="submenuVisible = !submenuVisible"
    >
      <div
        class="uppercase font-bold text-[color:var(--color-header-bottom-link)] hover:text-[color:var(--color-header-bottom-link-hover)] tracking-wide"
      >
        <slot>{{ title }}</slot>
      </div>

      <i
        class="fas ml-3 text-[color:var(--color-primary)] align-baseline"
        :class="[submenuVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
      />
    </div>

    <div
      v-if="submenuVisible"
      class="absolute z-10 bg-[color:var(--color-header-bottom-dropdown-bg)] rounded-md shadow-lg w-60 flex flex-col px-5 py-4 space-y-3 mt-2"
    >
      <template v-for="item in children" :key="item.title">
        <slot name="item" v-bind="{ item }">
          <router-link
            :to="item.route"
            class="font-bold text-[color:var(--color-header-bottom-dropdown-link)] hover:text-[color:var(--color-header-bottom-dropdown-link-hover)] text-sm"
            @click="submenuVisible = false"
          >
            {{ item.title }}
          </router-link>
        </slot>
      </template>
    </div>
  </div>

  <!-- Regular link -->
  <router-link
    v-else-if="to"
    :to="to"
    class="flex items-center cursor-pointer px-[0.8rem] py-[0.55rem] border-2 border-primary rounded text-sm uppercase font-bold text-[color:var(--color-header-bottom-link)] hover:text-[color:var(--color-header-bottom-link-hover)] tracking-wide"
    :class="$attrs.class"
  >
    <slot>{{ title }}</slot>
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

  children: {
    type: Array as PropType<MenuLink[]>,
    default: null,
  },
});

const submenu = shallowRef<HTMLElement | null>(null);
const submenuVisible = ref(false);

onClickOutside(submenu, () => {
  submenuVisible.value = false;
});
</script>
