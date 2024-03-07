<template>
  <StaticPage v-if="staticPage" />
  <template v-else-if="!loading">
    <LoginFormSection />

    <!-- Main content -->
    <div class="main">
      <div class="container mx-auto px-6 pb-40 pt-32 md:px-12">
        <div v-t="'pages.home.feature_descriptions_block.title'" class="px-6 text-center text-3xl font-bold"></div>
        <div class="mx-auto mt-24 flex flex-wrap justify-between">
          <div class="mb-24 w-full md:mb-0 md:mt-44 md:w-1/2 lg:w-1/4">
            <VcImage
              src="/static/images/home/hexa-1.webp"
              :alt="$t('pages.home.feature_descriptions_block.feature_1')"
              class="mx-auto w-full"
              lazy
            />
            <div
              v-t="'pages.home.feature_descriptions_block.feature_1'"
              class="mt-5 px-8 text-center text-2xl font-bold md:text-xl"
            ></div>
          </div>
          <div class="mb-24 w-full md:mb-0 md:w-1/2 lg:w-1/4">
            <VcImage
              src="/static/images/home/hexa-2.webp"
              :alt="$t('pages.home.feature_descriptions_block.feature_2')"
              class="mx-auto w-full"
              lazy
            />
            <div
              v-t="'pages.home.feature_descriptions_block.feature_2'"
              class="mt-5 px-8 text-center text-2xl font-bold md:text-xl"
            ></div>
          </div>
          <div class="mb-24 w-full md:mb-0 md:mt-44 md:w-1/2 lg:w-1/4">
            <VcImage
              src="/static/images/home/hexa-3.webp"
              :alt="$t('pages.home.feature_descriptions_block.feature_3')"
              class="mx-auto w-full"
              lazy
            />
            <div
              v-t="'pages.home.feature_descriptions_block.feature_3'"
              class="mt-5 px-8 text-center text-2xl font-bold md:text-xl"
            ></div>
          </div>
          <div class="mb-24 w-full md:mb-0 md:w-1/2 lg:w-1/4">
            <VcImage
              src="/static/images/home/hexa-4.webp"
              :alt="$t('pages.home.feature_descriptions_block.feature_4')"
              class="mx-auto w-full"
              lazy
            />
            <div
              v-t="'pages.home.feature_descriptions_block.feature_4'"
              class="mt-5 px-8 text-center text-2xl font-bold md:text-xl"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="bg-[color:var(--color-primary)] py-6 lg:py-10">
      <div class="container mx-auto flex flex-col items-center space-y-2 px-6 md:px-12 lg:flex-row lg:space-x-10">
        <div
          v-t="'pages.home.subscription_block.subscribe_now'"
          class="whitespace-nowrap text-3xl font-extrabold uppercase text-white"
        ></div>
        <div
          v-html-safe="$t('pages.home.subscription_block.info_message')"
          class="max-w-max text-base font-medium leading-tight text-white lg:max-w-min"
        />
        <div class="flex w-full grow space-x-6">
          <VcInput :placeholder="$t('pages.home.subscription_block.email_placeholder')" class="grow" no-border />
          <!-- todo: use VcButton -->
          <button
            v-t="'pages.home.subscription_block.subscribe_button'"
            type="button"
            class="h-11 rounded bg-white px-6 font-roboto text-sm font-bold uppercase shadow-md hover:bg-gray-200"
          ></button>
        </div>
      </div>
    </div>
  </template>
  <div v-else-if="loading" class="min-h-[80vh]">
    <VcLoaderOverlay />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getPage } from "@/core/api/graphql";
import { usePageHead } from "@/core/composables";
import { globals } from "@/core/globals";
import { useSlugInfo } from "@/shared/common";
import { LoginFormSection } from "@/shared/layout";
import { useStaticPage } from "@/shared/static-content";
import type { PageTemplate } from "@/shared/static-content";

const { t } = useI18n();

usePageHead({
  title: t("pages.home.meta.title"),
  meta: {
    keywords: t("pages.home.meta.keywords"),
    description: t("pages.home.meta.description"),
  },
});

const StaticPage = defineAsyncComponent(() => import("@/pages/static-page.vue"));
const { staticPage } = useStaticPage();
const { loading, slugInfo } = useSlugInfo("__index__home__page__");

const getPageParams = computed(() => {
  const { storeId } = globals;

  return { id: slugInfo?.value?.entityInfo?.objectId || "", storeId };
});

const { load: loadPage, result } = getPage(getPageParams);

watch(slugInfo, async (slugInfoValue) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

  if (slugInfoValue?.entityInfo?.objectType === "ContentFile") {
    await loadPage();
    if (typeof result?.value?.page?.content !== "string") {
      return;
    }
    const { content, settings } = JSON.parse(result.value.page.content) as PageTemplate;
    staticPage.value = { content, settings };
  }
});
</script>

<style scoped>
.main {
  background-image: url(/static/images/home/bevel-top.webp), url(/static/images/home/bevel-bottom.webp),
    url(/static/images/home/hexa-left.webp), url(/static/images/home/hexa-right.webp);
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
