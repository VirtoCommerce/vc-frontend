<template>
  <!-- Banner -->
  <div class="banner flex items-center">
    <div class="container mx-auto flex flex-col lg:flex-row items-center space-y-10 lg:space-x-24 p-6 md:p-12">
      <div v-if="!isAuthenticated" class="w-full lg:w-2/5 bg-white shadow-lg rounded p-6 md:p-10">
        <h1
          class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-8"
          v-t="'pages.home.sign_in_form_title'"
        ></h1>
        <SignInForm :grow-buttons="true" @succeeded="onSignIn" />
      </div>
      <div
        class="w-full lg:w-3/5 text-white font-bold filter drop-shadow-lg text-center lg:text-left text-3xl md:text-5xl select-none"
      >
        <div class="uppercase mb-8 leading-tight" v-html="$t('pages.home.main_banner_block.message')"></div>
        <div
          class="flex flex-col md:flex-row items-center justify-center lg:justify-start space-y-2 md:space-y-0 md:space-x-7 text-xl md:text-2xl"
        >
          <div v-t="'pages.home.main_banner_block.key_feature_1'"></div>
          <div class="w-2.5 h-2.5 bg-[color:var(--color-primary)] rounded-full"></div>
          <div v-t="'pages.home.main_banner_block.key_feature_2'"></div>
          <div class="w-2.5 h-2.5 bg-[color:var(--color-primary)] rounded-full"></div>
          <div v-t="'pages.home.main_banner_block.key_feature_3'"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main content -->
  <div class="main">
    <div class="container mx-auto pt-32 pb-40 px-6 md:px-12">
      <div class="font-bold text-3xl text-center px-6" v-t="'pages.home.feature_descriptions_block.title'"></div>
      <div class="flex flex-wrap justify-between mx-auto mt-24">
        <div class="w-full md:w-1/2 lg:w-1/4 md:mt-44 mb-24 md:mb-0">
          <VcImage src="/static/images/home/hexa-1.webp" class="mx-auto w-full" />
          <div
            class="px-8 font-bold text-2xl md:text-xl text-center mt-5"
            v-t="'pages.home.feature_descriptions_block.feature_1'"
          ></div>
        </div>
        <div class="w-full md:w-1/2 lg:w-1/4 mb-24 md:mb-0">
          <VcImage src="/static/images/home/hexa-2.webp" class="mx-auto w-full" />
          <div
            class="px-8 font-bold text-2xl md:text-xl text-center mt-5"
            v-t="'pages.home.feature_descriptions_block.feature_2'"
          ></div>
        </div>
        <div class="w-full md:w-1/2 lg:w-1/4 md:mt-44 mb-24 md:mb-0">
          <VcImage src="/static/images/home/hexa-3.webp" class="mx-auto w-full" />
          <div
            class="px-8 font-bold text-2xl md:text-xl text-center mt-5"
            v-t="'pages.home.feature_descriptions_block.feature_3'"
          ></div>
        </div>
        <div class="w-full md:w-1/2 lg:w-1/4 mb-24 md:mb-0">
          <VcImage src="/static/images/home/hexa-4.webp" class="mx-auto w-full" />
          <div
            class="px-8 font-bold text-2xl md:text-xl text-center mt-5"
            v-t="'pages.home.feature_descriptions_block.feature_4'"
          ></div>
        </div>
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div class="py-6 lg:py-10 bg-[color:var(--color-primary)]">
    <div class="container mx-auto flex flex-col lg:flex-row items-center space-y-2 lg:space-x-10 px-6 md:px-12">
      <div
        class="uppercase font-extrabold text-3xl text-white whitespace-nowrap"
        v-t="'pages.home.subscription_block.subscribe_now'"
      ></div>
      <div
        class="text-base font-medium leading-tight text-white max-w-max lg:max-w-min"
        v-html="$t('pages.home.subscription_block.info_message')"
      ></div>
      <div class="flex flex-grow w-full space-x-6">
        <input
          class="bg-white rounded h-11 flex-grow shadow-inner px-4 min-w-0 outline-none"
          :placeholder="$t('pages.home.subscription_block.email_placeholder')"
        />
        <!-- todo: use VcButton -->
        <button
          class="bg-white hover:bg-gray-200 px-6 uppercase text-sm font-roboto font-bold h-11 rounded shadow-md"
          v-t="'pages.home.subscription_block.subscribe_button'"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@/components";
import { useUser, SignInForm } from "@/shared/account";

const { isAuthenticated } = useUser();

async function onSignIn() {
  location.href = "/";
}
</script>

<style scoped>
.banner {
  position: relative;
  background: url(/static/images/home/main-banner.webp) center center no-repeat;
  background-size: cover;
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
