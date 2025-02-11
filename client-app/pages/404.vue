<template>
  <VcEmptyPage ref="page404Anchor" icon="outline-404" image="404.jpg">
    <h1 class="text-5xl font-black text-primary max-sm:order-first lg:mb-5 lg:text-8xl">
      {{ $t("pages.404.error_code") }}
    </h1>

    <VcTypography tag="h2" variant="h1" class="mb-5 max-sm:order-first sm:mb-2">
      {{ $t("pages.404.error_text") }}
    </VcTypography>

    <p class="mb-7 text-base text-neutral-700 lg:text-xl">
      {{ $t("pages.404.message") }}
    </p>

    <div>
      <VcButton to="/" min-width="11rem">
        {{ $t("pages.404.home_button") }}
      </VcButton>
    </div>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { useElementVisibility } from "@vueuse/core";
import { shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";

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
