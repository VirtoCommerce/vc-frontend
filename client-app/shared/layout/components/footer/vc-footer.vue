<template>
  <footer id="footer" aria-label="Footer" v-bind="getPreviewSectionAttrs(siteFooter?.id)">
    <!-- Top footer -->
    <div
      v-if="!compact"
      class="bg-[--footer-top-bg-color] px-10 pb-7 pt-8 text-[--footer-top-text-color] sm:flex sm:gap-14 md:gap-16 print:hidden"
    >
      <!-- Logo column -->
      <div class="mb-5 flex-none">
        <VcImage :src="footerLogoUrl" :alt="$context.storeName" class="h-11" lazy />
      </div>

      <nav class="grid sm:grow sm:grid-cols-2 sm:gap-12 md:grid-cols-3 lg:grid-cols-4 xl:gap-19 2xl:grid-cols-5">
        <template v-if="themeFooterColumns">
          <FooterLinks
            v-for="(column, index) in themeFooterColumns"
            :key="column.id ?? index"
            :links-block="column"
            v-bind="getPreviewSectionAttrs(column.id)"
          />
        </template>

        <template v-else-if="whiteLabelingFooterLinks?.length">
          <FooterLinks v-for="(footerLink, index) in whiteLabelingFooterLinks" :key="index" :links-block="footerLink" />
        </template>

        <template v-else>
          <FooterLinks v-for="footerLink in footerLinks" :key="footerLink.id" :links-block="footerLink" />
        </template>
      </nav>
    </div>

    <!-- Bottom footer -->
    <div
      class="flex flex-col items-center justify-between gap-1 bg-[--footer-bottom-bg-color] p-4 text-center text-sm text-[--footer-bottom-text-color] md:flex-row md:px-6 md:py-5 print:flex-row print:bg-additional-50 print:px-0 print:text-additional-950"
    >
      <span v-if="copyright">{{ copyright }}</span>

      <span v-else>
        {{ $t("shared.layout.footer.version") }} {{ version }}. © {{ new Date().getFullYear() }}
        <strong>{{ $t("shared.layout.footer.company_name") }}</strong
        >.
        {{ $t("shared.layout.footer.all_rights_reserved") }}
      </span>

      <i18n-t v-if="isCreditShown" keypath="shared.layout.footer.asp_net_e_commerce_platform" tag="span" scope="global">
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
import { onMounted } from "vue";
import { useNavigations, useWhiteLabeling } from "@/core/composables";
import { useFooterLogo } from "@/shared/layout/composables/useFooterLogo";
import { useThemeChrome } from "@/shared/layout/composables/useThemeChrome";
import { getPreviewSectionAttrs } from "@/shared/static-content/sections";
import pkg from "../../../../../package.json";
import FooterLinks from "./_internal/footer-links.vue";

interface IProps {
  compact?: boolean;
}

const props = defineProps<IProps>();

const { footerLinks: whiteLabelingFooterLinks } = useWhiteLabeling();
const { footerLogoUrl } = useFooterLogo();
const { footerLinks, fetchFooterLinks } = useNavigations();
const { footerColumns: themeFooterColumns, copyright, isCreditShown, siteFooter } = useThemeChrome();

const { version } = pkg;

onMounted(() => {
  if (!props.compact) {
    void fetchFooterLinks();
  }
});
</script>
