<template>
  <footer aria-label="Footer">
    <!-- Top footer -->
    <div
      v-if="!compact"
      class="bg-[--footer-top-bg-color] px-10 pb-7 pt-8 text-[--footer-top-text-color] sm:flex sm:gap-14 md:gap-16 print:!hidden"
    >
      <!-- Logo column -->
      <div class="mb-5 flex-none">
        <VcImage :src="secondaryLogoUrl" :alt="$context.storeName" class="h-11" lazy />
      </div>

      <div class="grid sm:grow sm:grid-cols-2 sm:gap-12 md:grid-cols-3 lg:grid-cols-4 xl:gap-19 2xl:grid-cols-5">
        <template v-if="whiteLabelingFooterLinks?.length">
          <FooterLinks v-for="(footerLink, index) in whiteLabelingFooterLinks" :key="index" :links-block="footerLink" />
        </template>

        <template v-else>
          <FooterLinks v-for="footerLink in footerLinks" :key="footerLink.id" :links-block="footerLink" />
        </template>
      </div>
    </div>

    <!-- Bottom footer -->
    <div
      class="flex flex-col items-center justify-between gap-1 bg-[--footer-bottom-bg-color] p-4 text-sm text-[--footer-bottom-text-color] sm:flex-row sm:px-6 sm:py-5 print:flex-row print:bg-additional-50 print:px-0 print:text-additional-950"
    >
      <span>
        {{ $t("shared.layout.footer.version") }} {{ version }}. © {{ new Date().getFullYear() }}
        <strong>{{ $t("shared.layout.footer.company_name") }}</strong
        >.
        {{ $t("shared.layout.footer.all_rights_reserved") }}
      </span>

      <i18n-t keypath="shared.layout.footer.asp_net_e_commerce_platform" tag="span" scope="global">
        <a
          class="font-bold text-[--footer-bottom-link-color] hover:text-[--footer-bottom-link-hover-color] print:text-additional-950"
          href="https://virtocommerce.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ $t("shared.layout.footer.by_virto") }}
        </a>
      </i18n-t>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useNavigations, useWhiteLabeling } from "@/core/composables";
import pkg from "../../../../../package.json";
import FooterLinks from "./_internal/footer-links.vue";

interface IProps {
  compact?: boolean;
}

defineProps<IProps>();

const { secondaryLogoUrl, footerLinks: whiteLabelingFooterLinks } = useWhiteLabeling();
const { footerLinks } = useNavigations();

const { version } = pkg;
</script>
