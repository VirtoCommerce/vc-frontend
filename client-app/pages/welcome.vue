<template>
  <VcContainer :has-bg-image="false">
    <VcEmptyView
      size="xl"
      reason="done"
      :text="$t('pages.welcome.title')"
      :description="$t('pages.welcome.description')"
    >
      <template #icon>
        <VcEmptyIcon name="registration-completed" />
      </template>

      <template #button>
        <VcButton to="/">
          {{ $t("common.buttons.home") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </VcContainer>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
const { t } = useI18n();

usePageHead({
  title: t("pages.welcome.meta.title"),
});
</script>
