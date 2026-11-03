<template>
  <div
    v-if="announcements.length"
    class="announcement-bar"
    :style="colors"
    v-bind="getPreviewSectionAttrs(announcementBar?.id)"
  >
    <template v-for="announcement in announcements" :key="announcement.id">
      <VcLink v-if="announcement.link" :to="announcement.link" class="announcement-bar__text announcement-bar__link">
        {{ announcement.text }}
      </VcLink>

      <span v-else class="announcement-bar__text">{{ announcement.text }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useThemeChrome } from "@/shared/layout/composables/useThemeChrome";
import { getPreviewSectionAttrs } from "@/shared/static-content/sections";
import type { StyleValue } from "vue";

/** A palette token name, as a `color-token` setting holds it: `color_primary_500`. */
const TOKEN_REGEX = /^[a-z][a-z0-9_]*$/;

const route = useRoute();
const { announcementBar } = useThemeChrome();

const announcements = computed(() => {
  const bar = announcementBar.value;

  if (!bar || (bar.home_only === true && route.path !== "/")) {
    return [];
  }

  return (bar.blocks ?? [])
    .filter((block) => block.type === "announcement" && !block.hidden && typeof block.text === "string" && block.text)
    .map((block) => ({
      id: block.id,
      text: block.text as string,
      link: typeof block.link === "string" && block.link ? block.link : undefined,
    }));
});

/** The bar's colors are palette tokens, so the bar follows the light and dark theme. */
const colors = computed<StyleValue>(() => ({
  "--bg-color": toTokenVariable(announcementBar.value?.background),
  "--text-color": toTokenVariable(announcementBar.value?.color),
}));

function toTokenVariable(token: unknown): string | undefined {
  return typeof token === "string" && TOKEN_REGEX.test(token) ? `var(--${token.replaceAll("_", "-")})` : undefined;
}
</script>

<style lang="scss">
.announcement-bar {
  @apply flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-5 py-2 text-center text-sm;

  background-color: var(--bg-color, theme("colors.neutral.900"));
  color: var(--text-color, theme("colors.additional.50"));

  @media print {
    @apply hidden;
  }

  &__link {
    @apply underline;
  }
}
</style>
