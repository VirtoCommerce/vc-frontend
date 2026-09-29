<template>
  <router-link v-slot="{ href, navigate, isActive, isExactActive }" :to="toValue" custom>
    <component
      :is="isLink ? 'a' : 'button'"
      :href="getHrefValue(href)"
      :class="['mobile-menu-link', { 'mobile-menu-link--big': big }, $attrs.class]"
      @click.prevent="click(navigate)"
    >
      <slot name="icon" v-bind="{ isActive, isExactActive }">
        <VcIcon
          v-if="link.icon"
          :name="link.icon"
          :size="22"
          :class="[
            'mobile-menu-link__icon',
            { 'mobile-menu-link__icon--active': isLink && (isActive || isExactActive) },
          ]"
        />
      </slot>

      <span
        :class="[
          'mobile-menu-link__text',
          {
            'mobile-menu-link__text--active': isLink && !isExternalLink && (isActive || isExactActive),
          },
        ]"
      >
        <slot v-bind="{ isActive, isExactActive, formattedText: formatTextFunction(link.title) }" />
      </span>

      <VcBadge v-if="count" variant="soft" color="neutral" rounded>
        {{ $n(count, { style: "decimal", notation: "compact" }) }}
      </VcBadge>

      <VcIcon v-if="isParent" class="mobile-menu-link__chevron" name="chevron-right" />
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
  /** A row of the menu's own outline (main list, account sections) rather than a drilled-in child. */
  big?: boolean;
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

<style lang="scss">
.mobile-menu-link {
  // 40 tall with 4 of air above and below the label: the menu is a floating plate now, and the
  // outline has to fit one screen without the list scrolling before the account block is
  // reached. The two sizes are the design's own pair — the outline is set in the display face,
  // a drilled-in child in the body one, so depth reads without indenting anything.
  @apply flex min-h-10 w-full items-center gap-x-3 py-1 text-left text-[0.9375rem] leading-tight tracking-[0.01em];

  &--big {
    @apply font-geologica text-[1.0625rem] font-semibold;
  }

  &__icon {
    color: var(--mobile-menu-icon-color);

    &--active {
      color: var(--mobile-menu-icon-active-color);
    }
  }

  &__text {
    @apply line-clamp-3 break-words;

    color: var(--mobile-menu-link-color);

    &--active {
      color: var(--mobile-menu-link-active-color);
    }
  }

  &__chevron {
    @apply ms-auto;

    color: var(--mobile-menu-navigation-color);
  }
}
</style>
