<template>
  <footer aria-label="Footer">
    <!-- Top footer -->
    <div
      v-if="!compact"
      class="hidden md:block bg-[color:var(--color-footer-top-bg)] text-[color:var(--color-footer-top-text)]"
    >
      <div class="container mx-auto grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5 p-12">
        <!-- Logo column -->
        <div class="hidden xl:block">
          <VcImage :src="$cfg.logo_inverted_image" :alt="$context.storeName" class="h-9" lazy />
        </div>

        <!-- Column 1 -->
        <div>
          <div
            v-t="'shared.layout.footer.company_information_link_group'"
            class="uppercase font-extrabold text-base text-white mb-3"
          ></div>
          <div class="flex flex-col space-y-1">
            <FooterLink v-t="'shared.layout.footer.about_us_link'" to="/about"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.investor_relations_link'" to="/investor-relations"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.supplier_overview_link'" to="/supplier-overview"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.worldwide_link'" to="/worldwide"></FooterLink>
          </div>
        </div>

        <!-- Column 2 -->
        <div>
          <div
            v-t="'shared.layout.footer.customer_support_link_group'"
            class="uppercase font-extrabold text-base text-white mb-3"
          ></div>
          <div class="flex flex-col space-y-1">
            <FooterLink v-t="'shared.layout.footer.catalog_request_link'" to="/catalog-request"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.contact_us_link'" to="/contact-us"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.feedback_link'" to="/feedback"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.find_a_branch_link'" to="/find-a-branch"></FooterLink>
          </div>
        </div>

        <!-- Column 3 -->
        <div>
          <div
            v-t="'shared.layout.footer.order_support_link_group'"
            class="uppercase font-extrabold text-base text-white mb-3"
          ></div>
          <div class="flex flex-col space-y-1">
            <FooterLink v-t="'shared.layout.footer.orders_link'" to="/orders"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.pick_up_link'" to="/pick-up"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.auto_reorder_link'" to="/auto-reorder"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.special_orders_link'" to="/special-orders"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.returns_cancellations_link'" to="/returns"></FooterLink>
          </div>
        </div>

        <!-- Column 4 -->
        <div>
          <div
            v-t="'shared.layout.footer.online_resources_ling_group'"
            class="uppercase font-extrabold text-base text-white mb-3"
          ></div>
          <div class="flex flex-col space-y-1">
            <FooterLink v-t="'shared.layout.footer.catalog_link'" :to="{ name: 'Catalog' }" />
            <FooterLink v-t="'shared.layout.footer.hot_buys_link'" to="/hot-buys"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.rebates_link'" to="/rebates"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.replacement_parts_link'" to="/replacement-parts"></FooterLink>
            <FooterLink v-t="'shared.layout.footer.demo_landing_link'" :to="{ name: 'DemoLanding' }" />
            <FooterLink v-t="'shared.layout.footer.demo_page_link'" to="/demo-page" />
            <FooterLink v-if="DEVELOPMENT" :to="{ name: 'DevUIKit' }">Dev UI Kit</FooterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom footer -->
    <div
      class="flex flex-col md:flex-row items-center justify-between h-16 text-xs font-medium px-4 md:px-12 py-3 bg-[color:var(--color-footer-bottom-bg)] text-[color:var(--color-footer-bottom-text)]"
    >
      <span>
        {{ $t("shared.layout.footer.version") }} {{ version }}. © {{ new Date().getFullYear() }}
        <strong>{{ $t("shared.layout.footer.company_name") }}</strong
        >.
        {{ $t("shared.layout.footer.all_rights_reserved") }}
      </span>

      <i18n-t keypath="shared.layout.footer.asp_net_e_commerce_platform" tag="span" scope="global">
        <a
          class="font-bold text-[color:var(--color-footer-bottom-link)] hover:text-[color:var(--color-footer-bottom-link-hover)]"
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
import pkg from "../../../../../package.json";
import FooterLink from "./_internal/footer-link.vue";
import { DEVELOPMENT } from "@/core/constants";

interface IProps {
  compact?: boolean;
}

defineProps<IProps>();

const { version } = pkg;
</script>
