<template>
  <footer aria-label="Footer">
    <!-- Top footer -->
    <div
      v-if="!compact"
      class="hidden bg-[color:var(--color-footer-top-bg)] text-[color:var(--color-footer-top-text)] md:block print:!hidden"
    >
      <div class="container mx-auto grid grid-cols-2 gap-4 p-12 lg:grid-cols-4 xl:grid-cols-5">
        <!-- Logo column -->
        <div class="hidden xl:block">
          <VcImage
            v-if="whiteLabelingSettings?.secondaryLogoUrl"
            :src="whiteLabelingSettings?.secondaryLogoUrl"
            :alt="$context.storeName"
            class="h-9"
            lazy
          />
          <VcImage v-else :src="$cfg.logo_inverted_image" :alt="$context.storeName" class="h-9" lazy />
        </div>

        <template v-if="whiteLabelingSettings?.footerLinks?.length">
          <div v-for="footerLink in whiteLabelingSettings.footerLinks" :key="footerLink.url">
            <div class="mb-3 text-base font-extrabold uppercase text-white">
              {{ footerLink.title }}
            </div>

            <div v-if="footerLink.childItems?.length" class="flex flex-col space-y-1">
              <FooterLink
                v-for="footerLinkChild in footerLink.childItems"
                :key="footerLinkChild.url"
                :title="footerLinkChild.title"
                :to="footerLinkChild.url"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <div v-for="footerLink in footerLinks" :key="footerLink.id">
            <div class="mb-3 text-base font-extrabold uppercase text-white">
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
        </template>
      </div>
    </div>

    <!-- Bottom footer -->
    <div
      class="flex h-16 flex-col items-center justify-between bg-[color:var(--color-footer-bottom-bg)] px-4 py-3 text-xs font-medium text-[color:var(--color-footer-bottom-text)] md:flex-row md:px-12 print:flex-row print:bg-[color:var(--color-white)] print:px-0 print:text-[color:var(--color-black)]"
    >
      <span>
        {{ $t("shared.layout.footer.version") }} {{ version }}. © {{ new Date().getFullYear() }}
        <strong>{{ $t("shared.layout.footer.company_name") }}</strong
        >.
        {{ $t("shared.layout.footer.all_rights_reserved") }}
      </span>

      <i18n-t keypath="shared.layout.footer.asp_net_e_commerce_platform" tag="span" scope="global">
        <a
          class="font-bold text-[color:var(--color-footer-bottom-link)] hover:text-[color:var(--color-footer-bottom-link-hover)] print:text-black"
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
import { useNavigations } from "@/core/composables";
import { useWhiteLabeling } from "@/shared/account";
import pkg from "../../../../../package.json";
import FooterLink from "./_internal/footer-link.vue";

interface IProps {
  compact?: boolean;
}

defineProps<IProps>();

const { footerLinks } = useNavigations();
const { settings: whiteLabelingSettings } = useWhiteLabeling();

const { version } = pkg;
</script>
