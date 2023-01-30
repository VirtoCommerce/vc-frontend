<template>
  <router-link :to="link.route ?? ''" custom v-slot="{ href, navigate, isActive, isExactActive }">
    <component
      :is="isLink ? 'a' : 'button'"
      :href="isLink ? href : null"
      :class="[
        'flex items-center gap-x-3.5 text-left leading-tight min-h-[2.25rem]',
        isLink && (isActive || isExactActive) ? 'text-white font-extrabold' : 'font-semibold',
        $attrs.class,
      ]"
      @click.prevent="click(navigate)"
    >
      <slot name="icon" v-bind="{ isActive, isExactActive }">
        <svg
          v-if="link.icon"
          height="36"
          width="36"
          :class="[
            'shrink-0',
            isLink && (isActive || isExactActive)
              ? 'text-[color:var(--color-primary)]'
              : 'text-[color:var(--color-mobile-menu-icon)]',
          ]"
        >
          <use :href="link.icon" />
        </svg>
      </slot>

      <span class="line-clamp-3">
        <slot v-bind="{ isActive, isExactActive }" />
      </span>

      <!-- Badge -->
      <VcTransitionScale mode="out-in">
        <span
          v-if="count"
          class="flex items-center transition-transform rounded-full border border-[color:var(--color-primary)] px-2 font-bold text-sm text-white h-6"
        >
          {{ preparedCount }}
        </span>
      </VcTransitionScale>

      <i v-if="isParent" class="ml-auto fas fa-chevron-right text-[color:var(--color-primary)]" />
    </component>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NavigationFailure } from "vue-router";
import { MenuLink, numberToShortString } from "@/core";

interface Props {
  link: MenuLink;
  count?: number;
}

interface Emits {
  (event: "select"): void;
  (event: "close"): void;
}

const props = withDefaults(defineProps<Props>(), { count: 0 });
const emit = defineEmits<Emits>();

const isParent = computed<boolean>(() => !!props.link.children?.length);
const isLink = computed<boolean>(() => !!props.link.route && !isParent.value);
const preparedCount = computed<string>(() => numberToShortString(props.count));

function click(navigate: () => Promise<void | NavigationFailure>) {
  if (isLink.value) {
    navigate();
    emit("close");
  } else {
    emit("select");
  }
}
</script>
