<template>
  <div :class="['vc-file-uploader', `vc-file-uploader--view--${view}`]">
    <input
      ref="fileInputRef"
      type="file"
      class="vc-file-uploader__input"
      :multiple="maxFiles > 1"
      :accept="allowedFormats.join(',')"
      @change="onFileChange"
    />

    <div v-if="files?.length" class="vc-file-uploader__list-container">
      <ul class="vc-file-uploader__list">
        <li v-for="(file, index) in files" :key="index">
          <VcFile :file="file" removable @remove="onRemove(file, index)" />
        </li>
      </ul>
    </div>

    <button
      type="button"
      class="vc-file-uploader__drop-container"
      :class="{ 'vc-file-uploader__drop-container--disabled': isMaxFileQuantityReached }"
      @dragover.prevent
      @dragenter.prevent
      @drop="onFileDrop"
      @click="openFilePicker"
    >
      <span class="vc-file-uploader__drop-area">
        <VcIcon class="vc-file-uploader__drop-icon" name="cloud-upload" size="lg" />

        <!-- todo add plural for file/files -->
        <span v-if="isMaxFileQuantityReached" class="vc-file-uploader__desktop"
          >You can add maximum {{ maxFiles }} files</span
        >
        <template v-else>
          <span class="vc-file-uploader__desktop"> Drag and drop file here or</span>
          <VcButton color="secondary" size="xs"> Browse your files </VcButton>
        </template>
      </span>

      <span class="vc-file-uploader__description">
        The files available for upload are in JPG, PNG, PDF, GIF formats, and their size should not exceed 6 Mb.
      </span>
    </button>

    <VcAlert
      v-if="files?.filter((file) => !!file.errorMessage).length"
      class="vc-file-uploader__alert"
      color="danger"
      variant="solid-light"
      size="sm"
      icon
    >
      Fix file upload errors to continue.
    </VcAlert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface IProps {
  maxFiles?: number;
  maxFileSize?: number;
  allowedFormats?: string[];
  view?: "horizontal" | "vertical";
  files?: VcFileType[];
}

interface IEmits {
  (event: "addFile", item: VcFileType): void;
  (event: "removeFile", index: number): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  maxFiles: 1,
  maxFileSize: 6e6,
  allowedFormats: () => [],
  view: "horizontal",
});

const fileInputRef = ref<HTMLInputElement>();

const isMaxFileQuantityReached = computed(() => {
  return props.files && props.files?.length >= props.maxFiles;
});

function openFilePicker() {
  fileInputRef.value?.click();
}

function getErrorMessage(file: File): string | undefined {
  if (props.allowedFormats.length && !props.allowedFormats.includes(file.type)) {
    return "format not supported";
  }
  if (props.maxFileSize < file.size) {
    return "file size over limit";
  }
}

function addFile(file: File) {
  const errorMessage = getErrorMessage(file);

  const fileInfo: VcFileType = {
    name: file.name,
    size: file.size,
    type: file.type,
    errorMessage,
    file,
  };

  emit("addFile", fileInfo);
}

function onFileChange(event: Event) {
  const fileList = (event.target as HTMLInputElement).files;

  if (fileList) {
    for (let i = 0; i < fileList.length; i++) {
      addFile(fileList[i]);
    }
  }
}

function onFileDrop(event: DragEvent) {
  event.preventDefault();

  const fileList = event.dataTransfer?.files;

  if (fileList) {
    for (let i = 0; i < fileList.length; i++) {
      addFile(fileList[i]);
    }
  }
}

function onRemove(file: VcFileType, index: number) {
  removeFileFromFileList(file);
  emit("removeFile", index);
}
function removeFileFromFileList(file: VcFileType) {
  if (!fileInputRef.value?.files || !file.file) {
    return;
  }
  const inputFiles = Array.from(fileInputRef.value.files);

  if (inputFiles.some((el) => el === file.file)) {
    const index = inputFiles.findIndex((el) => el === file.file);
    const dt = new DataTransfer();
    for (let i = 0; i < inputFiles.length; i++) {
      const existingFile = inputFiles[i];
      if (index !== i) {
        dt.items.add(existingFile);
      }
    }

    fileInputRef.value.files = dt.files;
  }
}
</script>

<style lang="scss">
.vc-file-uploader {
  $horizontal: &;
  $vertical: &;

  @apply flex flex-col flex-wrap gap-x-6 gap-y-4;

  &--view {
    &--horizontal {
      $horizontal: &;

      @media (min-width: theme("screens.md")) {
        @apply flex-row items-start;
      }
    }

    &--vertical {
      $vertical: &;

      @media (min-width: theme("screens.md")) {
        @apply flex-col;
      }
    }
  }

  &__input {
    @apply hidden;
  }

  &__list-container {
    @apply px-3 py-4 border border-[--color-neutral-200] rounded;

    #{$horizontal} & {
      @apply md:flex-1 md:shrink;
    }
  }

  &__list {
    @apply space-y-4;
  }

  &__drop-container {
    @apply flex flex-col gap-2.5;

    &--disabled {
      @apply opacity-40 pointer-events-none;
    }

    #{$horizontal} & {
      @apply order-first md:order-last md:self-stretch md:flex-1 md:shrink;
    }

    #{$vertical} & {
      @apply order-first;
    }
  }

  &__drop-area {
    @apply flex-1 flex flex-col justify-center items-center gap-2 w-full rounded border border-dashed border-[--color-secondary-200] p-5;
    @apply bg-[--color-secondary-50] #{!important};
  }

  &__drop-icon {
    @apply text-[--color-accent-500];
  }

  &__desktop {
    @apply hidden;

    @media (hover: hover) {
      @apply block text-sm text-[--color-neutral-900];

      & > span {
        @apply text-[--color-accent-500] font-bold;
      }
    }
  }

  &__description {
    @apply text-xs text-[--color-neutral-500] text-start;
  }

  &__alert {
    @apply order-last w-full;
  }
}
</style>
