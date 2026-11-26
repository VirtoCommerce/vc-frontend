<template>
  <VcContainer ref="page404Anchor" :has-bg-image="false">
    <VcEmptyView
      size="xl"
      reason="not-found"
      :text="$t('pages.404.error_text')"
      :description="$t('pages.404.empty_state.description')"
      :hint="$t('common.labels.error_code', { code: $t('pages.404.error_code') })"
    >
      <template #button>
        <VcButton to="/" variant="outline" color="secondary">
          {{ $t("pages.404.home_button") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </VcContainer>
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageTitle } from "@/core/composables";

const { t } = useI18n();

const page404Anchor = shallowRef<HTMLElement | null>(null);
const page404AnchorIsVisible = useElementVisibility(page404Anchor);

const head = useHead({});
const { title } = usePageTitle(`${t("pages.404.error_code")} ${t("pages.404.error_text")}`);

watch(page404AnchorIsVisible, (value) => {
  if (value && head) {
    head.patch({
      title: title.value,
    });
  }
});
</script>
