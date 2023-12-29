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

    <div v-if="uploadedFiles.length" class="vc-file-uploader__list-container">
      <ul class="vc-file-uploader__list">
        <li v-for="(file, index) in uploadedFiles" :key="index">
          <VcFile :file="file" removable @remove="removeFile(index)" />
        </li>
      </ul>
    </div>

    <button
      type="button"
      class="vc-file-uploader__drop-container"
      @dragover.prevent
      @dragenter.prevent
      @drop="onFileDrop"
      @click="openFilePicker"
    >
      <span class="vc-file-uploader__drop-area">
        <VcIcon class="vc-file-uploader__drop-icon" name="cloud-upload" size="lg" />

        <span class="vc-file-uploader__desktop"> Drag and drop file here or</span>

        <VcButton color="secondary" size="xs"> Browse your files </VcButton>
      </span>

      <span class="vc-file-uploader__description">
        The files available for upload are in JPG, PNG, PDF, GIF formats, and their size should not exceed 6 Mb.
      </span>
    </button>

    <VcAlert
      v-if="uploadedFiles.filter((file) => !!file.errorMessage).length || true"
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
import { ref } from "vue";
import { FileType } from "@/core/enums";

interface IProps {
  maxFiles?: number;
  maxFileSize?: number;
  allowedFormats?: string[];
  view?: "horizontal" | "vertical";
}

const props = withDefaults(defineProps<IProps>(), {
  maxFiles: 1,
  maxFileSize: 6e6,
  allowedFormats: () => [],
  view: "horizontal",
});

const fileInputRef = ref<HTMLInputElement | null>(null);
const uploadedFiles = ref<VcFileType[]>([]);

function openFilePicker() {
  fileInputRef.value?.click();
}

function validateFile(file: File) {
  return !(props.maxFileSize && props.maxFileSize < file.size);
}

function getIcon(file: VcFileType): string {
  let fileName: string;

  if (!file.type || file.errorMessage) {
    fileName = "error";
  } else if (Object.values(FileType).includes(file.type as FileType)) {
    fileName = file.type.replace("/", ":");
  } else {
    fileName = "file";
  }

  return `/static/icons/file/${fileName}.svg`;
}

function addFile(file: File) {
  if (validateFile(file) && uploadedFiles.value.length < props.maxFiles) {
    uploadedFiles.value.push({
      name: file.name,
      size: file.size,
      icon: getIcon(file),
      type: file.type,
      progress: 0,
      isUploaded: false,
    });
  }
}

function onFileChange(event: Event) {
  const files = (event.target as HTMLInputElement).files;

  if (files) {
    for (let i = 0; i < files.length; i++) {
      addFile(files[i]);
    }
  }
}

function onFileDrop(event: DragEvent) {
  event.preventDefault();

  const files = event.dataTransfer?.files;

  if (files) {
    for (let i = 0; i < files.length; i++) {
      addFile(files[i]);
    }
  }
}

function removeFile(index: number) {
  uploadedFiles.value.splice(index, 1);
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
