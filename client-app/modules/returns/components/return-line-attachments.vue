<template>
  <VcFileUploader
    v-bind="options"
    :files="files"
    removable
    @add-files="onAddFiles"
    @remove-files="onRemoveFiles"
    @download="onDownload"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { downloadFile, useFiles } from "@/shared/files";
import type { ReturnAttachmentFragmentType } from "@/modules/returns/types";

interface IProps {
  attachments: ReturnAttachmentFragmentType[];
  scope: string;
}

interface IEmits {
  (event: "update:urls", urls: string[]): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const attachedFiles = computed<IAttachedFile[]>(() =>
  props.attachments.map((attachment) => ({
    status: "attached",
    name: attachment.name,
    url: attachment.url,
    size: attachment.size,
    contentType: attachment.mimeType ?? undefined,
  })),
);

const { files, options, attachedAndUploadedFiles, addFiles, validateFiles, uploadFiles, removeFiles, fetchOptions } =
  useFiles(
    computed(() => props.scope),
    attachedFiles,
  );

// Only a finished upload carries a URL, and only a URL can be attached — one still in flight
// would be claimed as an empty reference.
watch(attachedAndUploadedFiles, (value) => {
  emit(
    "update:urls",
    value.map((file) => file.url).filter((url): url is string => !!url),
  );
});

function onAddFiles(items: INewFile[]): void {
  addFiles(items);
  validateFiles();
  void uploadFiles();
}

async function onRemoveFiles(items: FileType[]): Promise<void> {
  await removeFiles(items);
}

function onDownload(file: FileType): void {
  if (file.url) {
    void downloadFile(file.url, file.name);
  }
}

onMounted(async () => {
  await fetchOptions();
});
</script>
