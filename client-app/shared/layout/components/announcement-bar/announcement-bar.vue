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
import { useIsHomePage } from "@/core/composables/useIsHomePage";
import { toPaletteVariable } from "@/core/plugins/config.plugin";
import { DESIGNER_PREVIEW_PATH } from "@/core/theme-snapshot/query";
import { toNonEmptyString, toSafeLinkUrl } from "@/core/utilities/common";
import { useThemeChrome } from "@/shared/layout/composables/useThemeChrome";
import { useStaticPage } from "@/shared/static-content/composables/useStaticPage";
import { getPreviewSectionAttrs } from "@/shared/static-content/sections";
import type { StyleValue } from "vue";

const HOME_PERMALINK_REGEX = /^\/*$/;

const route = useRoute();
const isStorefrontHomePage = useIsHomePage();
const { announcementBar } = useThemeChrome();
const { staticPagePreviewSubject } = useStaticPage();

const isHomePage = computed(() => {
  if (route.path === DESIGNER_PREVIEW_PATH) {
    const permalink = staticPagePreviewSubject.value?.permalink;
    return permalink !== undefined && HOME_PERMALINK_REGEX.test(permalink);
  }

  return isStorefrontHomePage.value;
});

const announcements = computed(() => {
  const bar = announcementBar.value;

  if (!bar || (bar.home_only === true && !isHomePage.value)) {
    return [];
  }

  return (bar.blocks ?? []).flatMap((block) => {
    const text = toNonEmptyString(block.text);

    return block.type === "announcement" && !block.hidden && text
      ? [{ id: block.id, text, link: toSafeLinkUrl(block.link) }]
      : [];
  });
});

const colors = computed<StyleValue>(() => ({
  "--bg-token": toPaletteVariable(announcementBar.value?.background),
  "--text-token": toPaletteVariable(announcementBar.value?.color),
}));
</script>

<style lang="scss">
.announcement-bar {
  // A token the active preset does not define leaves its variable invalid, so the bar keeps these colours.
  --bg-color: var(--bg-token, theme("colors.neutral.900"));
  --text-color: var(--text-token, theme("colors.additional.50"));

  @apply flex flex-wrap items-center justify-center gap-x-6 gap-y-1 bg-[--bg-color] px-5 py-2 text-center text-sm text-[--text-color];

  @media print {
    @apply hidden;
  }

  &__link {
    @apply underline;
  }
}
</style>
