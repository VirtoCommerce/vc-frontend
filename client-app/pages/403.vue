<template>
  <VcContainer :has-bg-image="false">
    <VcEmptyView
      size="xl"
      reason="no-access"
      :text="$t('pages.403.empty_state.title')"
      :description="$t('pages.403.empty_state.description')"
      :hint="$t('common.labels.error_code', { code: $t('pages.403.error_code') })"
    >
      <template #button>
        <VcButton to="/" variant="outline" color="secondary">
          {{ $t("pages.403.home_button") }}
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
  title: `${t("pages.403.error_code")} ${t("pages.403.error_text")}`,
});
</script>
