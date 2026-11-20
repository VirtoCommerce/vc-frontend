<template>
  <VcContainer :has-bg-image="false">
    <VcEmptyView
      size="xl"
      reason="error"
      :text="$t('pages.500.empty_state.title')"
      :description="$t('pages.500.empty_state.description')"
      :hint="$t('common.labels.error_code', { code: $t('pages.500.error_code') })"
    >
      <template #button>
        <VcButton variant="outline" color="secondary" prepend-icon="refresh-cw" @click="reload">
          {{ $t("pages.500.empty_state.try_again_button") }}
        </VcButton>

        <VcButton to="/" variant="outline" color="secondary">
          {{ $t("pages.500.home_button") }}
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
  title: `${t("pages.500.error_code")} ${t("pages.500.error_text")}`,
});

function reload(): void {
  location.reload();
}
</script>
