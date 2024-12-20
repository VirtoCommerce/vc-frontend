<template>
  <TwoColumn class="max-w-screen-lg">
    <template #left>
      <h1 class="mb-5 text-7xl font-black text-primary md:text-8xl">
        {{ $t("pages.403.error_code") }}
      </h1>

      <VcTypography tag="h2" variant="h1" class="mb-2">
        {{ $t("pages.403.error_text") }}
      </VcTypography>

      <p class="mb-10 text-base leading-relaxed text-neutral-700 md:text-xl">
        {{ $t("pages.403.message") }}
      </p>
      <div>
        <VcButton to="/" class="w-40">
          {{ $t("pages.403.home_button") }}
        </VcButton>
      </div>
    </template>
    <template #right>
      <VcImage src="403.webp" :alt="$t('pages.403.img_alt')" class="w-full max-w-md" lazy />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { TwoColumn } from "@/shared/layout";

const { t } = useI18n();

usePageHead({
  title: `${t("pages.403.error_code")} ${t("pages.403.error_text")}`,
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
