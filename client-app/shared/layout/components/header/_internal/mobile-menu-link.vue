<template>
  <router-link v-slot="{ href, navigate, isActive, isExactActive }" :to="link.route ?? ''" custom>
    <component
      :is="isLink ? 'a' : 'button'"
      :href="isLink ? href : null"
      :class="[
        'flex min-h-[2.25rem] items-center gap-x-3.5 text-left leading-tight',
        isLink && (isActive || isExactActive) ? 'font-extrabold text-white' : 'font-semibold',
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
          class="flex h-6 items-center rounded-full border border-[color:var(--color-primary)] px-2 text-sm font-bold text-white transition-transform"
        >
          {{ preparedCount }}
        </span>
      </VcTransitionScale>

      <i v-if="isParent" class="fas fa-chevron-right ml-auto text-[color:var(--color-primary)]" />
    </component>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NavigationFailure } from "vue-router";
import { MenuLinkType, numberToShortString } from "@/core";

interface Props {
  link: MenuLinkType;
  count?: number;
}

interface Emits {
  (event: "select"): void;
  (event: "close"): void;
}

const emit = defineEmits<Emits>();
const props = withDefaults(defineProps<Props>(), { count: 0 });
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
