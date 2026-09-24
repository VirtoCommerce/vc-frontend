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
import { computed, toRefs, onMounted, watch } from "vue";
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
  emitFiles();
}

async function onRemoveFiles(filesToRemove: FileType[]) {
  await removeFiles(filesToRemove);

  emitFiles();
}

function emitFiles() {
  // Skip an empty report the section doesn't need: it would echo back as a new empty `value` and reset the field
  if (attachedAndUploadedFiles.value.length || value.value?.length) {
    emit("input", attachedAndUploadedFiles.value);
  }
}

function onFileDownload(file: FileType) {
  if (file && file.url) {
    void downloadFile(file.url, file.name);
  }
}

watch(value, (newValue) => {
  if (!newValue?.length && files.value.length > 0) {
    void removeFiles([...files.value]);
  }
});

onMounted(() => {
  void fetchFileOptions();
});
</script>
