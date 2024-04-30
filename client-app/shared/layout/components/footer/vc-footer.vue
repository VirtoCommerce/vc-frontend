<template>
  <footer aria-label="Footer">
    <!-- Top footer -->
    <div
      v-if="!compact"
      class="hidden bg-[--footer-top-bg-color] text-[--footer-top-text-color] md:block print:!hidden"
    >
      <div class="container mx-auto grid grid-cols-2 gap-4 p-12 lg:grid-cols-4 xl:grid-cols-5">
        <!-- Logo column -->
        <div class="hidden xl:block">
          <VcImage :src="siteLogoUrl" :alt="$context.storeName" class="h-9" lazy />
        </div>

        <div v-for="footerLink in footerLinks" :key="footerLink.id">
          <div class="mb-3 text-base font-black uppercase">
            {{ footerLink.title }}
          </div>

          <div v-if="footerLink.children?.length" class="flex flex-col space-y-1">
            <FooterLink
              v-for="footerLinkChild in footerLink.children"
              :key="footerLinkChild.id"
              :title="footerLinkChild.title"
              :to="footerLinkChild.route!"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom footer -->
    <div
      class="flex h-16 flex-col items-center justify-between bg-[--footer-bottom-bg-color] px-4 py-3 text-xs font-medium text-[--footer-bottom-text-color] md:flex-row md:px-12 print:flex-row print:bg-additional-50 print:px-0 print:text-additional-950"
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
import { computed } from "vue";
import { useNavigations, useThemeContext } from "@/core/composables";
import { useWhiteLabeling } from "@/shared/account";
import pkg from "../../../../../package.json";
import FooterLink from "./_internal/footer-link.vue";

interface IProps {
  compact?: boolean;
}

defineProps<IProps>();

const { themeContext } = useThemeContext();
const { whiteLabelingSettings } = useWhiteLabeling();
const { footerLinks } = useNavigations();

const { version } = pkg;

const siteLogoUrl = computed(
  () => whiteLabelingSettings.value?.secondaryLogoUrl ?? themeContext.value?.settings?.logo_inverted_image,
);
</script>
