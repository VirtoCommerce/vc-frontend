<template>
  <div ref="homePageAnchor">
    <LoginFormSection />
    <!-- Main content -->
    <div class="main">
      <div class="container mx-auto px-6 pb-40 pt-32 md:px-12">
        <div class="px-6 text-center text-3xl font-bold">
          {{ $t("pages.home.feature_descriptions_block.title") }}
        </div>
        <div class="mx-auto mt-24 flex flex-wrap justify-between">
          <div class="mb-24 w-full md:mb-0 md:mt-44 md:w-1/2 lg:w-1/4">
            <VcImage
              src="/static/images/home/hexa-1.webp"
              :alt="$t('pages.home.feature_descriptions_block.feature_1')"
              class="mx-auto w-full"
              lazy
            />
            <div class="mt-5 px-8 text-center text-2xl font-bold md:text-xl">
              {{ $t("pages.home.feature_descriptions_block.feature_1") }}
            </div>
          </div>
          <div class="mb-24 w-full md:mb-0 md:w-1/2 lg:w-1/4">
            <VcImage
              src="/static/images/home/hexa-2.webp"
              :alt="$t('pages.home.feature_descriptions_block.feature_2')"
              class="mx-auto w-full"
              lazy
            />
            <div class="mt-5 px-8 text-center text-2xl font-bold md:text-xl">
              {{ $t("pages.home.feature_descriptions_block.feature_2") }}
            </div>
          </div>
          <div class="mb-24 w-full md:mb-0 md:mt-44 md:w-1/2 lg:w-1/4">
            <VcImage
              src="/static/images/home/hexa-3.webp"
              :alt="$t('pages.home.feature_descriptions_block.feature_3')"
              class="mx-auto w-full"
              lazy
            />
            <div class="mt-5 px-8 text-center text-2xl font-bold md:text-xl">
              {{ $t("pages.home.feature_descriptions_block.feature_3") }}
            </div>
          </div>
          <div class="mb-24 w-full md:mb-0 md:w-1/2 lg:w-1/4">
            <VcImage
              src="/static/images/home/hexa-4.webp"
              :alt="$t('pages.home.feature_descriptions_block.feature_4')"
              class="mx-auto w-full"
              lazy
            />
            <div class="mt-5 px-8 text-center text-2xl font-bold md:text-xl">
              {{ $t("pages.home.feature_descriptions_block.feature_4") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="bg-primary py-6 lg:py-10">
      <div class="container mx-auto flex flex-col items-center space-y-2 px-6 md:px-12 lg:flex-row lg:space-x-10">
        <div class="whitespace-nowrap text-3xl font-black uppercase text-additional-50">
          {{ $t("pages.home.subscription_block.subscribe_now") }}
        </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { LoginFormSection } from "@/shared/layout";

const { t } = useI18n();

const homePageAnchor = shallowRef<HTMLElement | null>(null);
const homePageAnchorIsVisible = useElementVisibility(homePageAnchor);

watch(homePageAnchorIsVisible, (value) => {
  if (value) {
    usePageHead({
      title: t("pages.home.meta.title"),
      meta: {
        keywords: t("pages.home.meta.keywords"),
        description: t("pages.home.meta.description"),
      },
    });

    useSeoMeta({
      ogUrl: window.location.toString(),
      ogTitle: t("pages.home.meta.title"),
      ogDescription: t("pages.home.meta.description"),
      ogType: "website",
    });
  }
});
</script>

<style scoped>
.main {
  background-image: url(/images/home/bevel-top.webp), url(/images/home/bevel-bottom.webp),
    url(/images/home/hexa-left.webp), url(/images/home/hexa-right.webp);
  background-repeat: no-repeat, no-repeat, no-repeat, no-repeat;
  background-size: 100%, 100%, auto, auto;
  background-position:
    top,
    bottom,
    left top 40%,
    right bottom;
}

@media (max-width: 768px) {
  .main {
    background-position:
      top,
      bottom,
      left -140px top 40%,
      right -140px bottom;
  }
}
</style>
