<template>
  <router-view v-if="currentStepId === 'OrderCompleted'" />

  <VcContainer v-else-if="initialized">
    <VcTypography tag="h1" variant="h2" weight="bold" class="mb-5">
      {{ pageTitle }}
    </VcTypography>

    <VcSteps
      :steps="steps"
      :current-step-index="currentStepIndex"
      :start-step-index="0"
      :disabled="loadingCheckout"
      class="mb-5"
    />

    <VcLoaderOverlay :visible="loadingCart || loadingCheckout" fixed-spinner />

    <router-view />
  </VcContainer>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { invoke } from "@vueuse/core";
import { computed, onMounted, Ref, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { RouteRecordName, useRoute } from "vue-router";
import { usePageHead } from "@/core";
import { useCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout";

const route = useRoute();
const { t } = useI18n();
const { loading: loadingCart, payment } = useCart();
const { loading: loadingCheckout, steps, initialize } = useCheckout();

const initialized = ref(false);
const currentStepId = computed<RouteRecordName>(() => route.name!);
const currentStepIndex = computed<number>(() => steps.value.findIndex((step) => step.id === currentStepId.value));

const pageTitle = computed<string>(() => steps.value[currentStepIndex.value]?.text ?? "<UNKNOWN__FOR_DEV_MODE>");

usePageHead({
  title: computed(() => [t("pages.checkout.meta.title"), pageTitle.value]),
});

invoke(async () => {
  console.log("invoke");
  if (currentStepId.value !== "OrderCompleted") {
    await initialize();
    initialized.value = true;
  }
});
</script>
