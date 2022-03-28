<template>
  <!-- Top footer -->
  <div class="hidden md:block bg-[color:var(--color-footer-top-bg)] text-[color:var(--color-footer-top-text)]">
    <div class="container mx-auto grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5 p-12">
      <!-- Logo column -->
      <div class="hidden xl:block">
        <VcImage :src="$cfg.logo_inverted_image" class="h-9" />
      </div>

      <!-- Column 1 -->
      <div>
        <div
          class="uppercase font-extrabold text-base text-white mb-3"
          v-t="'shared.layout.footer.company_information_link_group'"
        ></div>
        <div class="flex flex-col space-y-1">
          <FooterLink to="/about" v-t="'shared.layout.footer.about_us_link'"></FooterLink>
          <FooterLink to="/investor-relations" v-t="'shared.layout.footer.investor_relations_link'"></FooterLink>
          <FooterLink to="/supplier-overview" v-t="'shared.layout.footer.supplier_overview_link'"></FooterLink>
          <FooterLink to="/worldwide" v-t="'shared.layout.footer.worldwide_link'"></FooterLink>
        </div>
      </div>

      <!-- Column 2 -->
      <div>
        <div
          class="uppercase font-extrabold text-base text-white mb-3"
          v-t="'shared.layout.footer.customer_support_link_group'"
        ></div>
        <div class="flex flex-col space-y-1">
          <FooterLink to="/catalog-request" v-t="'shared.layout.footer.catalog_request_link'"></FooterLink>
          <FooterLink to="/contact-us" v-t="'shared.layout.footer.contact_us_link'"></FooterLink>
          <FooterLink to="/feedback" v-t="'shared.layout.footer.feedback_link'"></FooterLink>
          <FooterLink to="/find-a-branch" v-t="'shared.layout.footer.find_a_branch_link'"></FooterLink>
        </div>
      </div>

      <!-- Column 3 -->
      <div>
        <div
          class="uppercase font-extrabold text-base text-white mb-3"
          v-t="'shared.layout.footer.order_support_link_group'"
        ></div>
        <div class="flex flex-col space-y-1">
          <FooterLink to="/orders" v-t="'shared.layout.footer.orders_link'"></FooterLink>
          <FooterLink to="/pick-up" v-t="'shared.layout.footer.pick_up_link'"></FooterLink>
          <FooterLink to="/auto-reorder" v-t="'shared.layout.footer.auto_reorder_link'"></FooterLink>
          <FooterLink to="/special-orders" v-t="'shared.layout.footer.special_orders_link'"></FooterLink>
          <FooterLink to="/returns" v-t="'shared.layout.footer.returns_cancellations_link'"></FooterLink>
        </div>
      </div>

      <!-- Column 4 -->
      <div>
        <div
          class="uppercase font-extrabold text-base text-white mb-3"
          v-t="'shared.layout.footer.online_resources_ling_group'"
        ></div>
        <div class="flex flex-col space-y-1">
          <FooterLink :to="`/${SeoUrl.Catalog}`" v-t="'shared.layout.footer.catalog_link'"></FooterLink>
          <FooterLink to="/hot-buys" v-t="'shared.layout.footer.hot_buys_link'"></FooterLink>
          <FooterLink to="/rebates" v-t="'shared.layout.footer.rebates_link'"></FooterLink>
          <FooterLink to="/replacement-parts" v-t="'shared.layout.footer.replacement_parts_link'"></FooterLink>
          <FooterLink to="/demo-landing" v-t="'shared.layout.footer.demo_landing_link'"></FooterLink>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom footer -->
  <div
    class="flex flex-col md:flex-row items-center justify-between h-16 text-xs px-4 md:px-12 py-3 bg-[color:var(--color-footer-bottom-bg)] text-[color:var(--color-footer-bottom-text)]"
  >
    <div class="font-medium">
      Ver. {{ version }}. © {{ new Date().getFullYear() }} <span class="font-bold">VirtoCommerce</span>.
      {{ $t("shared.layout.footer.all_rights_reserved") }}
    </div>

    <i18n-t keypath="shared.layout.footer.asp_net_e_commerce_platform" tag="div" scope="global">
      <a
        class="font-bold text-[color:var(--color-footer-bottom-link)] hover:text-[color:var(--color-footer-bottom-link-hover)]"
        href="#"
      >
        {{ $t("shared.layout.footer.by_virto") }}
      </a>
    </i18n-t>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@/components";
import { version } from "../../../../../package.json";
import FooterLink from "./_internal/footer-link.vue";
import SeoUrl from "@core/seo-routes.enum";
</script>
