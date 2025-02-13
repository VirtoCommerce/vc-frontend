<template>
  <router-link v-slot="{ href, navigate, isActive, isExactActive }" :to="toValue" custom>
    <component
      :is="isLink ? 'a' : 'button'"
      :href="getHrefValue(href)"
      :class="['flex min-h-9 items-center gap-x-3.5 text-left leading-tight tracking-[0.01em]', $attrs.class]"
      @click.prevent="click(navigate)"
    >
      <slot name="icon" v-bind="{ isActive, isExactActive }">
        <VcIcon
          v-if="link.icon"
          :name="link.icon"
          :size="32"
          :class="[
            isLink && (isActive || isExactActive)
              ? 'fill-[--mobile-menu-icon-active-color]'
              : 'fill-[--mobile-menu-icon-color]',
          ]"
        />
      </slot>

      <span
        :class="[
          'line-clamp-3 break-words',
          isLink && !isExternalLink && (isActive || isExactActive)
            ? 'text-[--mobile-menu-link-active-color]'
            : 'text-[--mobile-menu-link-color]',
        ]"
      >
        <slot v-bind="{ isActive, isExactActive, formattedText: formatTextFunction(link.title) }" />
      </span>

      <VcBadge v-if="count" variant="solid-light" color="neutral" size="lg" rounded>
        {{ $n(count, { style: "decimal", notation: "compact" }) }}
      </VcBadge>

      <VcIcon v-if="isParent" class="ml-auto fill-[--mobile-menu-navigation-color]" name="chevron-right" />
    </component>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getLinkAttr } from "@/core/utilities";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { NavigationFailure } from "vue-router";

interface IEmits {
  (event: "select"): void;
  (event: "close"): void;
}

interface IProps {
  link: ExtendedMenuLinkType;
  count?: number;
  formatTextFunction?: (text: string | undefined) => string;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  count: 0,
  formatTextFunction: (text: string | undefined) => text ?? "",
});

const isParent = computed<boolean>(() => !!props.link.children?.length);
const isLink = computed<boolean>(() => !!props.link.route || !!props.link.isCatalogItem);

function click(navigate: () => Promise<void | NavigationFailure>) {
  if (isParent.value) {
    emit("select");
  } else {
    if (isExternalLink.value) {
      window.open(props.link.route as string, "_blank")?.focus();
    } else {
      void navigate();
    }
    emit("close");
  }
}

const isExternalLink = computed(() => {
  return isLink.value && "externalLink" in getLinkAttr(props.link.route);
});

function getHrefValue(href?: string) {
  if (isExternalLink.value) {
    return props.link.route;
  }
  return href;
}

const toValue = computed(() => {
  if (isExternalLink.value) {
    return "";
  }
  return props.link.route ?? "#";
});
</script>
