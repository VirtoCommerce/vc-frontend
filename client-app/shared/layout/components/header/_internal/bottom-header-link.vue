<template>
  <!-- Dropdown menu -->
  <div v-if="children?.length" ref="submenu" class="relative">
    <div
      class="uppercase font-extrabold text-gray-500 flex items-center cursor-pointer"
      @click="submenuVisible = !submenuVisible"
    >
      <div>
        <slot>{{ title }}</slot>
      </div>
      <i
        class="fas ml-3 text-yellow-500 align-baseline"
        :class="[submenuVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
      ></i>
    </div>
    <div
      v-if="submenuVisible"
      class="absolute z-10 bg-white rounded-md shadow-lg w-60 flex flex-col px-5 py-4 space-y-3 mt-2"
    >
      <template v-for="(item, i) in children" :key="i">
        <slot name="item">
          <router-link :to="item.url" class="font-bold text-gray-500 text-sm" @click="submenuVisible = false">
            {{ item.title }}
          </router-link>
        </slot>
      </template>
    </div>
  </div>
  <!-- Regular link -->
  <router-link v-else :to="to" class="menu-link uppercase font-extrabold text-gray-500" :class="$attrs.class">
    <slot>{{ title }}</slot>
  </router-link>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import { IMenuItem } from "../../../";

defineProps({
  title: {
    type: String,
    default: undefined,
  },

  to: {
    type: String,
    default: undefined,
  },

  children: {
    type: Array as PropType<IMenuItem[]>,
    default: null,
  },
});

const submenu = ref(null);
const submenuVisible = ref(false);

onClickOutside(submenu.value, () => {
  submenuVisible.value = false;
});
</script>

<style>
.menu-link.router-link-active {
  position: relative;
}

.menu-link.router-link-active:after {
  content: "";
  height: 3px;
  background-color: #ffbe2e;
  position: absolute;
  width: 100%;
  margin-top: 5px;
  display: block;
}
</style>
