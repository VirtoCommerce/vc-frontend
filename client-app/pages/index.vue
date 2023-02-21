<template>
  <!-- Banner -->
  <div class="banner flex items-center" :style="{ backgroundImage: `url(${$cfg.homepage_background_image})` }">
    <div class="container mx-auto flex flex-col items-center space-y-10 p-6 md:p-12 lg:flex-row lg:space-x-24">
      <div class="w-full rounded bg-white p-6 shadow-lg md:p-10 lg:w-2/5">
        <h1 v-t="'pages.home.sign_in_form_title'" class="mb-8 text-3xl font-bold uppercase tracking-wide lg:text-4xl" />
        <SignInForm grow-buttons @succeeded="onSignIn" />
      </div>
      <div
        class="w-full select-none text-center text-3xl font-bold text-white drop-shadow-lg md:text-5xl lg:w-3/5 lg:text-left"
      >
        <div class="mb-8 uppercase leading-tight" v-html="$t('pages.home.main_banner_block.message')"></div>
        <div
          class="flex flex-col items-center justify-center space-y-2 text-xl md:flex-row md:space-y-0 md:space-x-7 md:text-2xl lg:justify-start"
        >
          <div v-t="'pages.home.main_banner_block.key_feature_1'"></div>
          <div class="h-2.5 w-2.5 rounded-full bg-[color:var(--color-primary)]"></div>
          <div v-t="'pages.home.main_banner_block.key_feature_2'"></div>
          <div class="h-2.5 w-2.5 rounded-full bg-[color:var(--color-primary)]"></div>
          <div v-t="'pages.home.main_banner_block.key_feature_3'"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main content -->
  <div class="main">
    <div class="container mx-auto px-6 pt-32 pb-40 md:px-12">
      <div v-t="'pages.home.feature_descriptions_block.title'" class="px-6 text-center text-3xl font-bold"></div>
      <div class="mx-auto mt-24 flex flex-wrap justify-between">
        <div class="mb-24 w-full md:mt-44 md:mb-0 md:w-1/2 lg:w-1/4">
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
        <div class="mb-24 w-full md:mt-44 md:mb-0 md:w-1/2 lg:w-1/4">
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
        class="max-w-max text-base font-medium leading-tight text-white lg:max-w-min"
        v-html="$t('pages.home.subscription_block.info_message')"
      ></div>
      <div class="flex w-full grow space-x-6">
        <VcInput :placeholder="$t('pages.home.subscription_block.email_placeholder')" class="grow" no-border />
        <!-- todo: use VcButton -->
        <button
          v-t="'pages.home.subscription_block.subscribe_button'"
          class="h-11 rounded bg-white px-6 font-roboto text-sm font-bold uppercase shadow-md hover:bg-gray-200"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { SignInForm } from "@/shared/account";

const { t } = useI18n();

usePageHead({
  title: t("pages.home.meta.title"),
  meta: {
    keywords: t("pages.home.meta.keywords"),
    description: t("pages.home.meta.description"),
  },
});

function onSignIn() {
  location.href = "/";
}
</script>

<style scoped>
.banner {
  position: relative;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  min-height: 549px;
}

.main {
  background-image: url(/static/images/home/bevel-top.png), url(/static/images/home/bevel-bottom.png),
    url(/static/images/home/hexa-left.png), url(/static/images/home/hexa-right.png);
  background-repeat: no-repeat, no-repeat, no-repeat, no-repeat;
  background-size: 100%, 100%, auto, auto;
  background-position: top, bottom, left top 40%, right bottom;
}

@media (max-width: 768px) {
  .main {
    background-position: top, bottom, left -140px top 40%, right -140px bottom;
  }
}
</style>
