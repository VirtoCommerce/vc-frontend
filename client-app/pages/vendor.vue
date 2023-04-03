<template>
  <VcLoaderOverlay v-if="!initialized" no-bg />

  <VcContainer v-else-if="vendor" class="relative z-0">
    <VcLoaderOverlay :visible="loading" fixed-spinner />

    <VcBreadcrumbs class="mb-2 hidden lg:block" :items="breadcrumbs" />

    <!-- Page title -->
    <VcTypography tag="h1" variant="h2" weight="bold" class="mb-7">
      {{ vendor.name }}
    </VcTypography>

    <VcLayoutWithRightSidebar v-if="vendor">
      <template #default>
        <VcSection class="pb-4 shadow">
          <template #title>
            <div class="flex items-center gap-5 p-8 max-md:flex-wrap xl:gap-8">
              <VcImage :src="vendor.iconUrl" :alt="$t('pages.vendor.header_block.logo_alt')" class="h-20" lazy />
              <div class="mx-auto max-md:order-last max-md:basis-full">{{ vendor.about }}</div>
              <div class="flex flex-col justify-between self-stretch">
                <VcRatingInfo
                  :label="$t('pages.vendor.header_block.rating_label')"
                  :rating="vendor.rating?.value"
                  :review-count="vendor.rating?.reviewCount"
                />
              </div>
            </div>
          </template>
          <div class="mb-2 hidden h-[18px] bg-gradient-to-b from-[#94949421] lg:block"></div>
          <CustomerReviews :options="customerReviewOptions" />
        </VcSection>
      </template>
      <template v-if="vendor.addresses?.items?.length || vendor.phones.length || vendor.emails.length" #sidebar>
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
                class="text-sm font-medium"
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
    </VcLayoutWithRightSidebar>
  </VcContainer>

  <Error404 v-else />
</template>

<script setup lang="ts">
import { invoke } from "@vueuse/core";
import { computed, defineAsyncComponent, inject, ref, toRefs } from "vue";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { configInjectionKey } from "@/core/injection-keys";
import { CustomerReviews, useVendor } from "@/shared/vendor";
import {
  VcAddressInfo,
  VcBreadcrumbs,
  VcCard,
  VcContainer,
  VcImage,
  VcLayoutWithRightSidebar,
  VcList,
  VcListItem,
  VcLoaderOverlay,
  VcRatingInfo,
  VcSection,
  VcTypography,
} from "@/ui-kit/components";
import type { ICustomerReviewOptions } from "@/shared/vendor/types";

interface IProps {
  vendorId: string;
}

const props = defineProps<IProps>();
const { vendorId } = toRefs(props);

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

const config = inject(configInjectionKey, {});
const initialized = ref(false);

const { loading, item: vendor, load } = useVendor(vendorId);

usePageHead({
  title: computed(() => vendor.value?.seoInfo?.pageTitle || vendor.value?.name),
  meta: {
    keywords: computed(() => vendor.value?.seoInfo?.metaKeywords),
    description: computed(() => vendor.value?.seoInfo?.metaDescription),
  },
});

const breadcrumbs = useBreadcrumbs(() => (vendor.value?.name ? [{ title: vendor.value.name }] : []));

const customerReviewOptions = computed<ICustomerReviewOptions>(() => ({
  entityId: vendor.value!.id,
  entityName: vendor.value!.name!,
  entityType: vendor.value!.memberType,
}));

invoke(async () => {
  if (config.vendor_enabled) {
    await load();
  }

  initialized.value = true;
});
</script>
