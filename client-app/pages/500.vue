<template>
  <VcEmptyPage icon="outline-alert" image="servers.jpg">
    <h1 class="text-5xl font-black text-primary max-sm:order-first lg:mb-5 lg:text-8xl">
      {{ $t("pages.500.error_code") }}
    </h1>

    <VcTypography tag="h2" variant="h1" class="mb-5 max-sm:order-first sm:mb-2">
      {{ $t("pages.500.error_text") }}
    </VcTypography>

    <p class="mb-7 text-base text-neutral-700 lg:text-xl">
      {{ $t("pages.500.message") }}
    </p>

    <div>
      <VcButton to="/" min-width="11rem">
        {{ $t("pages.500.home_button") }}
      </VcButton>
    </div>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { getHeadInstance } from "@/core/utilities/head";

const { t } = useI18n();
const head = getHeadInstance();

usePageHead(
  {
    title: `${t("pages.500.error_code")} ${t("pages.500.error_text")}`,
  },
  head,
);
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
