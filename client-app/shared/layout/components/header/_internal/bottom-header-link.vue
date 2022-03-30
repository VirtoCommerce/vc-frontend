<template>
  <!-- Dropdown menu -->
  <div v-if="children?.length" ref="submenu" class="relative">
    <div
      class="uppercase font-extrabold text-[color:var(--color-header-bottom-link)] hover:text-[color:var(--color-header-bottom-link-hover)] flex items-center cursor-pointer tracking-wide"
      @click="submenuVisible = !submenuVisible"
    >
      <div>
        <slot>{{ title }}</slot>
      </div>
      <i
        class="fas ml-3 text-[color:var(--color-primary)] align-baseline"
        :class="[submenuVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
      ></i>
    </div>
    <div
      v-if="submenuVisible"
      class="absolute z-10 bg-[color:var(--color-header-bottom-dropdown-bg)] rounded-md shadow-lg w-60 flex flex-col px-5 py-4 space-y-3 mt-2"
    >
      <template v-for="(item, i) in children" :key="i">
        <slot name="item">
          <router-link
            :to="item.url"
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
    class="menu-link uppercase font-extrabold text-[color:var(--color-header-bottom-link)] hover:text-[color:var(--color-header-bottom-link-hover)] tracking-wide"
    :class="$attrs.class"
  >
    <slot>{{ title }}</slot>
  </router-link>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import { MenuLinkType } from "@/core/api/graphql/types";
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
    type: Array as PropType<MenuLinkType[]>,
    default: null,
  },
});

const submenu = ref(null);
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
