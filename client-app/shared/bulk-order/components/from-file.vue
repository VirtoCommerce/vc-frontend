<template>
  <article>
    <VcTypography tag="h2" class="hidden border-b px-5 py-2 lg:block">
      {{ $t("shared.bulk_order.from_file.title") }}
    </VcTypography>
    <div class="flex gap-4 px-7 py-6">
      <section v-if="processing" class="w-full">
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
        <section class="flex flex-1 flex-col items-stretch">
          <p class="mb-3 text-sm">
            {{ $t("shared.bulk_order.from_file.upload.message") }}
          </p>
          <VcFileUploader class="h-full" v-bind="fileOptions" :files="files" @add-files="onAddFiles" />
        </section>
        <aside>
          <figure>
            <figcaption class="mb-3 text-sm">{{ $t("shared.bulk_order.from_file.upload.examples.title") }}</figcaption>
            <VcImage
              id="example"
              src="/static/images/bulk-order/documents-example.webp"
              :alt="$t('shared.bulk_order.from_file.upload.examples.alt')"
              class="h-[230px]"
              lazy
            />
          </figure>
        </aside>
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import { inject, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useCreatePurchaseRequestFromDocumentMutation } from "@/core/api/graphql/purchase-request/mutations/createPurchaseRequestFromDocument";
import { configInjectionKey } from "@/core/injection-keys";
import { DEFAULT_PURCHASE_REQUEST_FILES_SCOPE } from "@/shared/bulk-order/constants";
import { useFiles } from "@/shared/files/composables/useFiles";

const config = inject(configInjectionKey, {});
const router = useRouter();
const {
  files,
  addFiles,
  validateFiles,
  uploadFiles,
  fetchOptions: fetchFileOptions,
  options: fileOptions,
} = useFiles(config.purchase_request_file_scope ?? DEFAULT_PURCHASE_REQUEST_FILES_SCOPE);

const { mutate: createPurchaseRequestFromDocument } = useCreatePurchaseRequestFromDocumentMutation();

const processing = ref(false);

async function onAddFiles(items: INewFile[]) {
  processing.value = true;

  addFiles(items);
  validateFiles();
  await uploadFiles();

  const documentUrl = files.value[0]?.url;
  if (documentUrl) {
    await createPurchaseRequestFromDocument({ command: { documentUrl } });
  }

  await router.push({ name: "Cart" });

  processing.value = false;
}

watchEffect(async () => {
  await Promise.all([fetchFileOptions()]);
});
</script>

<style lang="scss">
#example {
  padding-bottom: calc(theme("spacing.3") + theme("fontSize.xs"));
}
</style>
