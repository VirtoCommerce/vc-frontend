<template>
  <div class="option-file">
    <VcFileUploader
      :files="files"
      v-bind="fileOptions"
      removable
      @add-files="onAddFiles"
      @remove-files="onRemoveFiles"
      @download="onFileDownload"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, watchEffect } from "vue";
import { downloadFile, useFiles } from "@/shared/files";
import { toAttachedFile } from "@/ui-kit/utilities";
import type { CartConfigurationItemFileType } from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

const emit = defineEmits<IEmits>();
const props = defineProps<Props>();

const { value } = toRefs(props);

const DEFAULT_FILES_SCOPE = "configuration-files";

interface Props {
  isRequired: boolean;
  value?: DeepReadonly<CartConfigurationItemFileType[]>;
  selected?: boolean;
  name: string;
}

interface IEmits {
  (e: "input", value: CartConfigurationItemFileType[]): void;
}

const initialFiles = computed(
  () => value.value?.map((file) => toAttachedFile(file.name, file.size, file.contentType, file.url)) ?? [],
);

const {
  files,
  attachedAndUploadedFiles,
  addFiles,
  validateFiles,
  removeFiles,
  uploadFiles,
  fetchOptions: fetchFileOptions,
  options: fileOptions,
} = useFiles(DEFAULT_FILES_SCOPE, initialFiles);

async function onAddFiles(items: INewFile[]) {
  addFiles(items);
  validateFiles();
  await uploadFiles();
  emit("input", attachedAndUploadedFiles.value);
}

async function onRemoveFiles(filesToRemove: FileType[]) {
  await removeFiles(filesToRemove);
  validateFiles();
  emit("input", attachedAndUploadedFiles.value);
}

function onFileDownload(file: FileType) {
  if (file && file.url) {
    void downloadFile(file.url, file.name);
  }
}

watchEffect(async () => {
  await fetchFileOptions();
});
</script>
