<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <div
      class="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 bg-additional-50 px-6 shadow-md lg:h-auto lg:px-12 lg:py-5 print:relative print:px-0 print:shadow-none"
    >
      <router-link to="/" replace>
        <VcImage :src="siteLogoUrl" :alt="$context.storeName" class="h-9 lg:h-12 print:h-[3rem]" lazy />
      </router-link>

      <div class="flex">
        <div class="flex items-center gap-x-1.5 text-neutral-500 print:mr-[-1px] print:border print:px-2">
          <VcIcon size="xs" name="lock-closed" />

          <span class="hidden text-sm font-semibold xs:inline print:inline">
            {{ $t("common.labels.secure_checkout") }}
          </span>
        </div>

        <Created />
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative flex grow flex-col">
      <slot />
    </div>

    <VcFooter compact />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";
import { useWhiteLabeling } from "@/shared/account";
import VcFooter from "../footer/vc-footer.vue";
import Created from "../print/created.vue";

const { themeContext } = useThemeContext();
const { whiteLabelingSettings } = useWhiteLabeling();

const siteLogoUrl = computed(() => whiteLabelingSettings.value?.logoUrl ?? themeContext.value?.settings?.logo_image);
</script>
