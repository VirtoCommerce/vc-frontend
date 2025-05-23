<template>
  <div class="option-file">
    <VcFileUploader
      data-test-id="file-option"
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
import { computed, toRefs, onMounted } from "vue";
import { downloadFile, useFiles } from "@/shared/files";
import { toAttachedFile } from "@/ui-kit/utilities";
import type { CartConfigurationItemFileType } from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

interface IProps {
  value?: DeepReadonly<CartConfigurationItemFileType[]>;
}

interface IEmits {
  (e: "input", value: CartConfigurationItemFileType[]): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { value } = toRefs(props);

const DEFAULT_FILES_SCOPE = "product-configuration";

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

  emit("input", attachedAndUploadedFiles.value);
}

function onFileDownload(file: FileType) {
  if (file && file.url) {
    void downloadFile(file.url, file.name);
  }
}

onMounted(() => {
  void fetchFileOptions();
});
</script>
