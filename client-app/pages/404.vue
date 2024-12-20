<template>
  <TwoColumn ref="page404Anchor" class="max-w-screen-lg">
    <template #left>
      <h1 class="mb-5 text-7xl font-black text-neutral-900 md:text-8xl">
        {{ $t("pages.404.error_code") }}
      </h1>

      <VcTypography tag="h2" variant="h1" class="mb-2">
        {{ $t("pages.404.error_text") }}
      </VcTypography>

      <p class="mb-10 text-base leading-relaxed text-neutral-700 md:text-xl">
        {{ $t("pages.404.message") }}
      </p>
      <div>
        <VcButton to="/" class="w-40">
          {{ $t("pages.404.home_button") }}
        </VcButton>
      </div>
    </template>
    <template #right>
      <VcImage src="404.webp" :alt="$t('pages.404.img_alt')" class="w-full max-w-md" lazy />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { useElementVisibility } from "@vueuse/core";
import { shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { TwoColumn } from "@/shared/layout";

const { t } = useI18n();

const page404Anchor = shallowRef<HTMLElement | null>(null);
const page404AnchorIsVisible = useElementVisibility(page404Anchor);

watch(page404AnchorIsVisible, (value) => {
  if (value) {
    usePageHead({
      title: `${t("pages.404.error_code")} ${t("pages.404.error_text")}`,
    });
  }
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
