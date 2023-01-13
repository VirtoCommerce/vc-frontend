<template>
  <VcMain v-if="vendor">
    <template v-slot:nav>
      <VcBreadcrumbs class="hidden lg:block mb-3" :items="breadcrumbs" />
    </template>
    <template v-slot:header>
      <h1 class="font-bold uppercase text-2xl lg:text-3xl text-gray-800 px-5 mb-7 md:px-0">{{ vendor.name }}</h1>
    </template>
    <template v-slot>
      <VcSection class="shadow pb-4">
        <template #title>
          <div class="flex items-center gap-5 lg:gap-8 p-7">
            <VcImage :src="vendor.iconUrl" :alt="$t('pages.vendor.header_block.logo_alt')" class="h-20" lazy />
            {{ vendor.about }}
            <div class="flex flex-wrap self-stretch content-between">
              <div>
                <div class="font-bold">{{ $t("pages.vendor.header_block.rating_label") }}</div>
                <Rating :rating="vendor.rating" />
              </div>
              <VcButton size="xs" is-outline class="uppercase whitespace-nowrap px-3">
                {{ $t("pages.vendor.header_block.leave_feedback") }}
              </VcButton>
            </div>
          </div>
        </template>
        <div class="hidden h-[18px] bg-gradient-to-b from-[#94949421] lg:block"></div>

        <CustomerReviews :vendor-id="vendorId"></CustomerReviews>
      </VcSection>
    </template>
    <template v-slot:sidebar>
      <VcCard
        :title="$t('pages.vendor.contacts_card.title')"
        header-classes="px-6 py-3"
        content-classes="px-6 pt-4 pb-5"
        shadow
      >
        <VcList>
          <VcListItem v-if="vendor.addresses?.items?.length" :title="$t('pages.vendor.contacts_card.address')">
            <VcAddressInfo
              v-for="address in vendor.addresses?.items"
              :key="address.key"
              :address="address"
              class="font-medium text-sm"
            ></VcAddressInfo>
          </VcListItem>
          <VcListItem
            v-if="vendor.phones.length"
            :title="$t('pages.vendor.contacts_card.phone')"
            :description="vendor.phones.join('\r\n')"
          />
          <VcListItem
            v-if="vendor.emails.length"
            :title="$t('pages.vendor.contacts_card.email')"
            :description="vendor.emails.join('\r\n')"
          />
        </VcList>
      </VcCard>
    </template>
  </VcMain>

  <Error404 v-else-if="!loading" />
</template>

<script setup lang="ts">
import { useBreadcrumbs, usePageHead } from "@/core";
import { VcMain } from "@/shared/layout";
import { CustomerReviews, Rating, useVendor } from "@/shared/vendor";
import {
  VcAddressInfo,
  VcBreadcrumbs,
  VcButton,
  VcCard,
  VcImage,
  VcList,
  VcListItem,
  VcSection,
} from "@/ui-kit/components";
import { computed, defineAsyncComponent, toRefs } from "vue";

export interface Props {
  vendorId: string;
}

const props = defineProps<Props>();
const { vendorId } = toRefs(props);

const { loading, item: vendor } = useVendor(vendorId);

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

usePageHead({
  title: computed(() => vendor.value?.seoInfo?.pageTitle || vendor.value?.name),
  meta: {
    keywords: computed(() => vendor.value?.seoInfo?.metaKeywords),
    description: computed(() => vendor.value?.seoInfo?.metaDescription),
  },
});

const { breadcrumbs } = useBreadcrumbs(computed(() => [{ title: vendor.value?.name }]));
</script>
