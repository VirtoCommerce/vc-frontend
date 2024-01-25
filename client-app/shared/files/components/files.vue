<template>
  <VcFileUploader
    :max-file-count="fileOptions.maxFileCount"
    :max-file-size="fileOptions.maxFileSize"
    :allowed-extensions="fileOptions.allowedExtensions"
    :files="files"
    @add-files="onAddFiles"
    @remove-files="onRemoveFiles"
  />
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { onMounted, toRefs } from "vue";
import { useFiles } from "@/shared/files/composables";

interface IEmits {
  (event: "update:files", files: FileType[]): void;
}

interface IProps {
  scope: string;
  files: FileType[];
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const { scope } = toRefs(props);
const files = useVModel(props, "files", emit);

const {
  addFiles,
  validateFiles,
  uploadFiles,
  removeFiles,
  fetchOptions: fetchSettings,
  options: fileOptions,
} = useFiles(scope, files);

onMounted(async () => {
  await fetchSettings();
});

async function onAddFiles(items: INewFile[]) {
  addFiles(items);
  validateFiles();
  await uploadFiles();
}

async function onRemoveFiles(items: FileType[]) {
  await removeFiles(items);
}
</script>
