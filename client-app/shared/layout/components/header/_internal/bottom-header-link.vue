<template>
  <!-- Dropdown menu -->
  <div v-if="children?.length" ref="submenu" class="relative">
    <div
      class="font-semibold text-[color:var(--color-header-bottom-link)] hover:text-[color:var(--color-header-bottom-link-hover)] flex items-center cursor-pointer tracking-wide"
      @click="submenuVisible = !submenuVisible"
    >
      <svg height="26" width="26" class="mx-auto shrink-0" name="icon">
        <use :href="icon"></use>
      </svg>
      <slot>{{ title }}</slot>
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
  <router-link v-else-if="to" v-slot="{ isActive }" :to="to">
    <div
      class="font-semibold hover:text-[color:var(--color-header-bottom-link-hover)] tracking-wide relative"
      :class="[
        {
          'text-[color:var(--color-header-bottom-link)]': !isActive,
          'text-[color:var(--color-header-bottom-link-hover)]': isActive,
        },
      ]"
    >
      <svg
        v-if="icon"
        height="26"
        width="26"
        class="mx-auto mb-[0.35rem]"
        :class="['shrink-0', { 'text-[color:var(--color-primary)]': !isActive }]"
        name="icon"
      >
        <use :href="icon"></use>
      </svg>
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

<style>
.menu-link.router-link-active {
  position: relative;
  color: var(--color-header-bottom-link-hover);
}

.menu-link.router-link-active:after {
  content: "";
  height: 3px;
  background-color: var(--color-primary);
  position: absolute;
  width: 100%;
  margin-top: 5px;
  display: block;
}
</style>
