<template>
  <!-- Top footer -->
  <div class="hidden md:block bg-gray-800">
    <div class="container mx-auto grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5 p-12">
      <!-- Logo column -->
      <div class="hidden xl:block">
        <VcImage src="/static/images/common/logo-white.svg" class="h-9" />
      </div>

      <!-- Column 1 -->
      <div>
        <div class="uppercase font-extrabold text-base text-white mb-3">Company information</div>
        <div class="flex flex-col space-y-1">
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/investor-relations">Investor Relations</FooterLink>
          <FooterLink to="/supplier-overview">Supplier Overview</FooterLink>
          <FooterLink to="/worldwide">Worlwide</FooterLink>
        </div>
      </div>

      <!-- Column 2 -->
      <div>
        <div class="uppercase font-extrabold text-base text-white mb-3">Customer support</div>
        <div class="flex flex-col space-y-1">
          <FooterLink to="/catalog-request">Catalog Request</FooterLink>
          <FooterLink to="/contact-us">Contact Us</FooterLink>
          <FooterLink to="/feedback">Feedback</FooterLink>
          <FooterLink to="/find-a-branch">Find A Branch</FooterLink>
        </div>
      </div>

      <!-- Column 3 -->
      <div>
        <div class="uppercase font-extrabold text-base text-white mb-3">Order support</div>
        <div class="flex flex-col space-y-1">
          <FooterLink to="/orders">Orders</FooterLink>
          <FooterLink to="/pick-up">Pick-Up</FooterLink>
          <FooterLink to="/auto-reorder">Auto-Reorder</FooterLink>
          <FooterLink to="/special-orders">Special Orders</FooterLink>
          <FooterLink to="/returns">Returns & Cancellations</FooterLink>
        </div>
      </div>

      <!-- Column 4 -->
      <div>
        <div class="uppercase font-extrabold text-base text-white mb-3">Online resources</div>
        <div class="flex flex-col space-y-1">
          <FooterLink :to="`/${SeoUrl.Catalog}`">Catalog</FooterLink>
          <FooterLink to="/hot-buys">Hot Buys</FooterLink>
          <FooterLink to="/rebates">Rebates</FooterLink>
          <FooterLink to="/replacement-parts">Replacement Parts</FooterLink>
          <FooterLink to="/demo-landing">Demo landing</FooterLink>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom footer -->
  <div
    class="bg-gray-900 flex flex-col md:flex-row items-center justify-between h-16 text-white text-xs px-4 md:px-12 py-3"
  >
    <div class="font-medium">
      Ver. {{ version }}. © {{ new Date().getFullYear() }} <span class="font-bold">VirtoCommerce</span>. All Rights
      Reserved.
    </div>
    <div>ASP.NET ecommerce platform <a class="text-blue-400 hover:text-blue-500 font-bold" href="#">by Virto</a></div>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@/components";
import { version } from "../../../../../package.json";
import FooterLink from "./_internal/footer-link.vue";
import SeoUrl from "@core/seo-routes.enum";
</script>
