<template>
  <VcWidget :title="!isMobile ? $t('shared.bulk_order.from_file.title') : undefined" size="md">
    <div :class="{ 'grid gap-4 md:grid-cols-[auto_290px]': !creatingPurchaseRequest }">
      <section v-if="creatingPurchaseRequest">
        <p class="mb-3 text-sm">
          {{ $t("shared.bulk_order.from_file.processing.message") }}
        </p>
        <VcLoaderWithText
          centered
          :text="$t('shared.bulk_order.from_file.processing.loading_message')"
          class="mb-6 min-h-[230px] w-full border border-neutral-200 bg-neutral-50"
        />
        <nav class="flex justify-end border-t py-3">
          <VcButton min-width="9rem">{{ $t("shared.bulk_order.from_file.processing.cancel") }}</VcButton>
        </nav>
      </section>
      <template v-else>
        <header class="text-sm max-md:text-center">
          {{ $t("shared.bulk_order.from_file.upload.message") }}
        </header>
        <aside class="row-span-2">
          <figure>
            <figcaption class="mb-3 hidden text-sm md:block">
              {{ $t("shared.bulk_order.from_file.upload.examples.title") }}
            </figcaption>
            <VcImage
              id="example"
              src="/static/images/bulk-order/documents-example.webp"
              :alt="$t('shared.bulk_order.from_file.upload.examples.alt')"
              class="h-[230px] md:object-cover md:object-left"
              lazy
            />
          </figure>
        </aside>
        <section class="items-stretch">
          <VcFileUploader class="h-full" v-bind="fileOptions" :files="files" @add-files="onAddFiles" />
        </section>
      </template>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useNewPurchaseRequest } from "@/modules/purchase-requests/composables/useNewPurchaseRequest";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const router = useRouter();

const { files, fileOptions, fetchFileOptions, creatingPurchaseRequest, createPurchaseRequestFromDocuments } =
  useNewPurchaseRequest();

async function onAddFiles(items: INewFile[]) {
  const purchaseRequestId = await createPurchaseRequestFromDocuments(items);
  void router.push({ name: "PurchaseRequest", params: { purchaseRequestId } });
}

watchEffect(async () => {
  await Promise.all([fetchFileOptions()]);
});
</script>

<style lang="scss">
#example {
  @media (min-width: theme("screens.md")) {
    padding-bottom: calc(theme("spacing.3") + theme("fontSize.xs"));
  }
}
</style>
