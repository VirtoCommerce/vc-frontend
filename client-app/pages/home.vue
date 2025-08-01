<template>
  <div ref="homePageAnchor">
    <LoginFormSection />

    <!-- Main content -->
    <section class="container mx-auto px-6 pb-40 pt-32 md:px-12">
      <VcTypography tag="h2" text-transform="none" variant="h1" align="center">
        {{ $t("pages.home.feature_descriptions_block.title") }}
      </VcTypography>

      <div class="mx-auto mt-24 flex flex-wrap justify-between">
        <div class="mb-24 w-full md:mb-0 md:mt-44 md:w-1/2 lg:w-1/4">
          <div class="flex justify-center">
            <VcCompositeShape
              icon="outline-case"
              img="sign-in.jpg"
              :alt="$t('pages.home.feature_descriptions_block.feature_1')"
            />
          </div>

          <div class="mt-5 px-8 text-center text-2xl font-bold md:text-xl">
            {{ $t("pages.home.feature_descriptions_block.feature_1") }}
          </div>
        </div>

        <div class="mb-24 w-full md:mb-0 md:w-1/2 lg:w-1/4">
          <div class="flex justify-center">
            <VcCompositeShape
              icon="outline-payments"
              img="boxes.jpg"
              :alt="$t('pages.home.feature_descriptions_block.feature_1')"
            />
          </div>

          <div class="mt-5 px-8 text-center text-2xl font-bold md:text-xl">
            {{ $t("pages.home.feature_descriptions_block.feature_2") }}
          </div>
        </div>

        <div class="mb-24 w-full md:mb-0 md:mt-44 md:w-1/2 lg:w-1/4">
          <div class="flex justify-center">
            <VcCompositeShape
              icon="outline-products"
              img="statuses.jpg"
              :alt="$t('pages.home.feature_descriptions_block.feature_1')"
            />
          </div>

          <div class="mt-5 px-8 text-center text-2xl font-bold md:text-xl">
            {{ $t("pages.home.feature_descriptions_block.feature_3") }}
          </div>
        </div>

        <div class="mb-24 w-full md:mb-0 md:w-1/2 lg:w-1/4">
          <div class="flex justify-center">
            <VcCompositeShape
              icon="outline-document"
              img="tax.jpg"
              :alt="$t('pages.home.feature_descriptions_block.feature_1')"
            />
          </div>

          <div class="mt-5 px-8 text-center text-2xl font-bold md:text-xl">
            {{ $t("pages.home.feature_descriptions_block.feature_4") }}
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-primary py-6 lg:py-10">
      <div class="container mx-auto flex flex-col items-center space-y-2 px-6 md:px-12 lg:flex-row lg:space-x-10">
        <h2 class="whitespace-nowrap text-3xl font-black uppercase text-additional-50">
          {{ $t("pages.home.subscription_block.subscribe_now") }}
        </h2>

        <div
          v-html-safe="$t('pages.home.subscription_block.info_message')"
          class="max-w-max text-base leading-tight text-additional-50 lg:max-w-min"
        />

        <div class="flex w-full grow space-x-6">
          <VcInput :placeholder="$t('pages.home.subscription_block.email_placeholder')" class="grow" no-border />

          <VcButton variant="outline" min-width="8rem" class="shadow-md">
            {{ $t("pages.home.subscription_block.subscribe_button") }}
          </VcButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { usePageTitle } from "@/core/composables/usePageTitle";
import { LoginFormSection } from "@/shared/layout";

const { t } = useI18n();

const homePageAnchor = shallowRef<HTMLElement | null>(null);
const homePageAnchorIsVisible = useElementVisibility(homePageAnchor);

const { title: pageTitle } = usePageTitle(t("pages.home.meta.title"));

useSeoMeta({
  title: () => (homePageAnchorIsVisible.value ? pageTitle.value : undefined),
  keywords: () => (homePageAnchorIsVisible.value ? t("pages.home.meta.keywords") : undefined),
  description: () => (homePageAnchorIsVisible.value ? t("pages.home.meta.description") : undefined),
  ogUrl: () => (homePageAnchorIsVisible.value ? window.location.toString() : undefined),
  ogTitle: () => (homePageAnchorIsVisible.value ? t("pages.home.meta.title") : undefined),
  ogDescription: () => (homePageAnchorIsVisible.value ? t("pages.home.meta.description") : undefined),
  ogType: () => (homePageAnchorIsVisible.value ? "website" : undefined),
});
</script>
