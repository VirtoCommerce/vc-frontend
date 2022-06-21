<template>
  <router-link :to="to" custom v-slot="{ href, navigate, isActive, isExactActive }">
    <component
      :is="isLink ? 'a' : 'div'"
      :href="isLink ? href : null"
      :class="[
        'flex items-center leading-none',
        {
          'text-white font-extrabold': isLink && (isActive || isExactActive),
          'font-semibold': !(isLink && (isActive || isExactActive)),
        },
        $attrs.class,
      ]"
      @click.prevent="isLink ? navigate() && $emit('close') : $emit('select')"
    >
      <slot name="icon" v-bind="{ isActive, isExactActive }">
        <svg
          v-if="icon"
          height="36"
          width="36"
          :class="[
            'shrink-0 ml-0.5 mr-3.5',
            { 'text-[color:var(--color-primary)]': isLink && (isActive || isExactActive) },
          ]"
        >
          <use :href="icon" />
        </svg>
      </slot>

      <slot v-bind="{ isActive, isExactActive }">
        <span>{{ title }}</span>
      </slot>

      <i v-if="isParent" class="fas fa-chevron-right ml-3 -mb-px text-[color:var(--color-primary)]" />
    </component>
  </router-link>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { RouteLocationRaw } from "vue-router";
import { eagerComputed } from "@vueuse/core";

defineEmits(["select", "close"]);

const props = defineProps({
  isParent: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: "",
  },

  icon: {
    type: String,
    default: "",
  },

  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: "",
  },
});

const isLink = eagerComputed<boolean>(() => !!props.to && !props.isParent);
</script>
