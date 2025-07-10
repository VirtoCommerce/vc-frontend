<template>
  <section class="banner flex items-center" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="container mx-auto flex flex-col items-center space-y-10 p-6 md:p-12 lg:flex-row lg:space-x-24">
      <div v-if="!isAuthenticated" class="w-full rounded bg-additional-50 p-6 shadow-lg md:p-10 lg:w-2/5">
        <VcTypography tag="h2" variant="h1" class="mb-8">
          {{ $t("pages.home.sign_in_form_title") }}
        </VcTypography>

        <SignInForm grow-buttons />
      </div>

      <div class="w-full select-none text-center font-bold text-additional-50 drop-shadow-lg lg:w-3/5 lg:text-left">
        <i18n-t
          keypath="pages.home.main_banner_block.message"
          tag="h1"
          class="mb-8 text-3xl uppercase leading-tight md:text-5xl"
        >
          <template #br><br /></template>
        </i18n-t>

        <div
          class="flex flex-col items-center justify-center space-y-2 text-xl md:flex-row md:space-x-7 md:space-y-0 md:text-2xl lg:justify-start"
        >
          <div>
            {{ $t("pages.home.main_banner_block.key_feature_1") }}
          </div>

          <VcIcon name="circle-solid" class="fill-primary" size="xxs" />

          <div>
            {{ $t("pages.home.main_banner_block.key_feature_2") }}
          </div>

          <VcIcon name="circle-solid" class="fill-primary" size="xxs" />

          <div>
            {{ $t("pages.home.main_banner_block.key_feature_3") }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";
import { SignInForm, useUser } from "@/shared/account";
import { getImageUrl } from "@/ui-kit/utilities";

const { themeContext } = useThemeContext();
const { isAuthenticated } = useUser();

const bgImage = computed(() =>
  themeContext.value.settings.homepage_background_image
    ? getImageUrl(themeContext.value.settings.homepage_background_image)
    : "none",
);
</script>

<style scoped>
.banner {
  position: relative;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  min-height: 549px;
}
</style>
