<template>
  <VcEmptyPage image="lock.jpg" icon="outline-security">
    <VcTypography tag="h1" class="order-first mb-5 sm:pe-8 lg:pe-16">
      {{ $t("pages.blocked.title") }}
    </VcTypography>

    <VcTypography class="sm:pe-8 lg:pe-16">
      {{ $t("pages.blocked.message") }}
      <ContactAdministratorLink />.
    </VcTypography>
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
