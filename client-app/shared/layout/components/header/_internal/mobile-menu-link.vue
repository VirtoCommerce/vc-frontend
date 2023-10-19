<template>
  <router-link v-slot="{ href, navigate, isActive, isExactActive }" :to="link.route ?? ''" custom>
    <component
      :is="isLink ? 'a' : 'button'"
      :href="isLink ? href : null"
      :class="[
        'flex min-h-[2.25rem] items-center gap-x-3.5 text-left leading-tight tracking-[0.01em]',
        isLink && (isActive || isExactActive) ? 'text-[--color-additional-50]' : 'text-[--color-accent-200]',
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
            isLink && (isActive || isExactActive) ? 'text-[--color-primary-500]' : 'text-[--color-accent-300]',
          ]"
        >
          <use :href="link.icon" />
        </svg>
      </slot>

      <span class="line-clamp-3 break-words">
        <slot v-bind="{ isActive, isExactActive }" />
      </span>

      <!-- Badge -->
      <VcTransitionScale mode="out-in">
        <span
          v-if="count"
          class="flex h-6 items-center rounded-full border border-[--color-primary-500] px-2 text-sm font-bold text-[--color-additional-50] transition-transform"
        >
          {{ preparedCount }}
        </span>
      </VcTransitionScale>

      <VcIcon v-if="isParent" class="ml-auto text-[--color-primary-500]" name="chevron-right" />
    </component>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { numberToShortString } from "@/core/utilities";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { NavigationFailure } from "vue-router";

interface IEmits {
  (event: "select"): void;
  (event: "close"): void;
}

interface IProps {
  link: ExtendedMenuLinkType;
  count?: number;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  count: 0,
});

const isParent = computed<boolean>(() => !!props.link.children?.length);
const isLink = computed<boolean>(() => !!props.link.route);
const preparedCount = computed<string>(() => numberToShortString(props.count));

function click(navigate: () => Promise<void | NavigationFailure>) {
  if (isParent.value) {
    emit("select");
  } else {
    navigate();
    emit("close");
  }
}
</script>
