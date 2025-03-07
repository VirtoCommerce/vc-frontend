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
    <div class="option-file__errors">
      <VcAlert
        v-for="(file, index) in filesWithErrors"
        :key="index"
        color="danger"
        variant="solid-light"
        size="sm"
        icon
      >
        {{ file.errorMessage }}
      </VcAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import { downloadFile, useFiles } from "@/shared/files";
import { toAttachedFile } from "@/ui-kit/utilities";
import type { CartConfigurationItemFileType } from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { value } = toRefs(props);

const DEFAULT_FILES_SCOPE = "configuration-files";

interface IProps {
  value?: DeepReadonly<CartConfigurationItemFileType[]>;
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

const filesWithErrors = computed(() => files.value.filter((file) => file.errorMessage));

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

void fetchFileOptions();
</script>

<style lang="scss">
.option-file {
  &__errors {
    @apply mt-2 flex flex-col gap-2;
  }
}
</style>
