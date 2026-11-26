<template>
  <VcContainer :has-bg-image="false">
    <VcEmptyView
      size="xl"
      reason="no-access"
      :text="$t('pages.blocked.title')"
      :description="$t('pages.blocked.empty_state.description')"
    >
      <template #icon>
        <VcEmptyIcon name="account-blocked" />
      </template>

      <template #button>
        <VcButton to="/contacts" variant="outline" color="secondary">
          {{ $t("pages.blocked.empty_state.contact_button") }}
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
  title: t("pages.blocked.meta.title"),
});
</script>
