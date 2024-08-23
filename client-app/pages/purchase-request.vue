<template>
  <VcContainer class="relative z-0">
    <VcBreadcrumbs :items="breadcrumbs" class="max-lg:hidden" />

    <VcTypography tag="h1" class="mb-5"
      >{{ $t("pages.purchase_request.title") }} {{ purchaseRequest?.number }}</VcTypography
    >

    <Cart
      v-if="purchaseRequest?.cartId"
      class="p-0"
      cart-type="PurchaseRequest"
      :cart-name="purchaseRequest.number"
      hide-header
      hide-quote-widget
    >
      <template #main>
        <VcWidget :title="$t('pages.purchase_request.files_section.title')" prepend-icon="document-add" size="lg">
          <VcFileUploader
            class="h-full"
            v-bind="fileOptions"
            :files="files"
            @add-files="onAddFiles"
            @download="onFileDownload"
          />
        </VcWidget>
      </template>
    </Cart>
  </VcContainer>
</template>

<script setup lang="ts">
import { inject, ref, toRef, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@/core/composables";
import { configInjectionKey } from "@/core/injection-keys";
import { DEFAULT_PURCHASE_REQUEST_FILES_SCOPE } from "@/shared/bulk-order/constants";
import { useFiles } from "@/shared/files/composables/useFiles";
import { downloadFile } from "@/shared/files/utils";
import { usePurchaseRequest } from "@/shared/purchase-request/composables/usePurchaseRequest";
import Cart from "@/pages/cart.vue";

interface IProps {
  id: string;
}

const props = defineProps<IProps>();

const propsRef = toRef(props);

const config = inject(configInjectionKey, {});
const { t } = useI18n();

const breadcrumbs = useBreadcrumbs([{ title: t("pages.bulk_order.title") }]);

const { purchaseRequest, sourceFiles } = usePurchaseRequest(propsRef);

const {
  files,
  addFiles,
  validateFiles,
  uploadFiles,
  fetchOptions: fetchFileOptions,
  options: fileOptions,
} = useFiles(config.purchase_request_file_scope ?? DEFAULT_PURCHASE_REQUEST_FILES_SCOPE, sourceFiles);
const processing = ref(false);

async function onAddFiles(items: INewFile[]) {
  processing.value = true;

  addFiles(items);
  validateFiles();
  await uploadFiles();

  const documentUrl = files.value[0]?.url;
  if (documentUrl) {
    // TODO
  }

  processing.value = false;
}

function onFileDownload(file: FileType) {
  if (file && file.url) {
    void downloadFile(file.url, file.name);
  }
}

watchEffect(async () => {
  await Promise.all([fetchFileOptions()]);
});
</script>
