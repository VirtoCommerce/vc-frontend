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
import { DESIGNER_PREVIEW_PATH } from "@/core/theme-snapshot/query";
import { isSafeLinkUrl } from "@/core/utilities/common";
import { useThemeChrome } from "@/shared/layout/composables/useThemeChrome";
import { useStaticPage } from "@/shared/static-content/composables/useStaticPage";
import { getPreviewSectionAttrs } from "@/shared/static-content/sections";
import type { StyleValue } from "vue";

const TOKEN_REGEX = /^[a-z][a-z0-9_]*$/;

const HOME_PERMALINK_REGEX = /^\/*$/;

const route = useRoute();
const { announcementBar } = useThemeChrome();
const { staticPagePreviewSubject } = useStaticPage();

const isHomePage = computed(() => {
  if (route.path === DESIGNER_PREVIEW_PATH) {
    const permalink = staticPagePreviewSubject.value?.permalink;
    return permalink !== undefined && HOME_PERMALINK_REGEX.test(permalink);
  }

  return route.path === "/";
});

const announcements = computed(() => {
  const bar = announcementBar.value;

  if (!bar || (bar.home_only === true && !isHomePage.value)) {
    return [];
  }

  return (bar.blocks ?? [])
    .filter((block) => block.type === "announcement" && !block.hidden && typeof block.text === "string" && block.text)
    .map((block) => ({
      id: block.id,
      text: block.text as string,
      link: typeof block.link === "string" && block.link && isSafeLinkUrl(block.link) ? block.link : undefined,
    }));
});

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
  --bg-color: theme("colors.neutral.900");
  --text-color: theme("colors.additional.50");

  @apply flex flex-wrap items-center justify-center gap-x-6 gap-y-1 bg-[--bg-color] px-5 py-2 text-center text-sm text-[--text-color];

  @media print {
    @apply hidden;
  }

  &__link {
    @apply underline;
  }
}
</style>
