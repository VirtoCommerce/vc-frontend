<template>
  <!-- Dropdown menu -->
  <div v-if="children?.length" class="relative">
    <div
      class="uppercase text-xl font-extrabold text-white flex items-center"
      @click="submenuVisible = !submenuVisible"
    >
      <div class="truncate">
        <slot>{{ title }}</slot>
      </div>
      <i
        class="fas ml-3 text-yellow-500 align-baseline"
        :class="[submenuVisible ? 'fa-chevron-up' : 'fa-chevron-down']"
      ></i>
    </div>
    <div v-if="submenuVisible" class="flex flex-col px-5 py-2 space-y-3 mt-2">
      <template v-for="(item, i) in children" :key="i">
        <slot name="item">
          <router-link :to="item.url" class="font-bold text-gray-200 text-lg" @click="$emit('close')">
            {{ item.title }}
          </router-link>
        </slot>
      </template>
    </div>
  </div>
  <!-- Regular link -->
  <router-link
    v-else
    :to="to"
    class="uppercase text-xl font-extrabold text-white"
    :class="$attrs.class"
    @click="$emit('close')"
  >
    <slot>{{ title }}</slot>
  </router-link>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
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

defineEmits(["close"]);

const submenuVisible = ref(false);
</script>
