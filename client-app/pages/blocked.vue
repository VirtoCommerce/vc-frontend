<template>
  <VcEmptyPage image="/static/images/blocked/image.webp" mobile-image="/static/images/blocked/image.webp">
    <template #description>
      <VcTypography tag="h1" class="mb-6">
        {{ $t("pages.blocked.title") }}
      </VcTypography>

      <VcTypography>
        <span>
          {{ $t("pages.blocked.message") }}
          <ContactAdministratorLink />.
        </span>
      </VcTypography>
    </template>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { ContactAdministratorLink } from "@/shared/common";

const { t } = useI18n();

usePageHead({
  title: t("pages.blocked.meta.title"),
});
</script>
