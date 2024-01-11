<template>
  <div :class="['vc-file-uploader', `vc-file-uploader--view--${view}`]">
    <input
      ref="fileInputRef"
      type="file"
      class="vc-file-uploader__input"
      :multiple="maxFiles > 1"
      :accept="allowedFormats?.join(',')"
      @change="onFileChange"
    />

    <div v-if="files?.length" class="vc-file-uploader__list-container">
      <ul class="vc-file-uploader__list">
        <li v-for="(file, index) in files" :key="index">
          <VcFile :file="file" removable @remove="onRemove(file)" />
        </li>
      </ul>
    </div>
    <div class="flex flex-col gap-2">
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

          <span v-if="isMaxFileQuantityReached" class="vc-file-uploader__desktop">{{
            $t("ui_kit.file_uploader.maximum", maxFiles)
          }}</span>
          <template v-else>
            <span class="vc-file-uploader__desktop">{{ $t("ui_kit.file_uploader.drag_and_drop") }}</span>
            <VcButton color="secondary" size="xs">{{ $t("ui_kit.file_uploader.browse") }}</VcButton>
          </template>
        </span>

        <span
          v-html-safe="$t('ui_kit.file_uploader.requirements', { format: fileFormats, size: '6 Mb' })"
          class="vc-file-uploader__description"
        />
      </button>

      <VcAlert
        v-if="files?.filter((file) => !!file.errorMessage).length"
        class="vc-file-uploader__alert"
        color="danger"
        variant="solid-light"
        size="sm"
        icon
      >
        {{ $t("ui_kit.file_uploader.error") }}
      </VcAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  maxFiles: 1,
  maxFileSize: 6e6,
  view: "horizontal",
});

const { t } = useI18n();

interface IProps {
  maxFiles?: number;
  maxFileSize?: number;
  accept?: string;
  allowedFormats?: Readonly<string[]>;
  view?: "horizontal" | "vertical";
  files?: VcFileType[];
}

interface IEmits {
  (event: "addFile", item: VcFileType): void;
  (event: "removeFile", item: VcFileType): void;
}

const fileInputRef = ref<HTMLInputElement>();

const isMaxFileQuantityReached = computed(() => {
  return props.files && props.files?.length >= props.maxFiles;
});

const fileFormats = computed(() => {
  const map: { [key: string]: string } = {
    "application/msword": "doc",
    "image/jpeg": "jpg, jpeg",
    "image/png": "png",
    "application/pdf": "pdf",
    "application/vnd.ms-excel": "xls, xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xls, xlsx",
    "application/zip": "zip",
    "text/plain": "txt",
    "application/x-zip-compressed": "zip",
    "application/x-rar-compressed": "rar",
    ".rar": "rar",
  };
  if (props.allowedFormats?.length) {
    const readableFormats: string[] = [];

    props.allowedFormats.forEach((el) => {
      const format = map[el] || el;

      if (!readableFormats.includes(format)) {
        readableFormats.push(format);
      }
    });
    return readableFormats.join(", ");
  }
  return t("ui_kit.file_uploader.any_format");
});

function openFilePicker() {
  fileInputRef.value?.click();
}

function getErrorMessage(file: File): string | undefined {
  let fileType: string = file.type;
  if (!fileType) {
    fileType = getFileTypeFromName(file.name);
  }
  if (props.allowedFormats?.length && !props.allowedFormats.includes(fileType)) {
    return "format not supported";
  }
  if (props.maxFileSize < file.size) {
    return "file size over limit";
  }
}

//workaround for rar https://mimeapplication.net/x-rar-compressed
function getFileTypeFromName(name: string): string {
  const extension = name.split(".").at(-1);
  const map: { [key: string]: string } = {
    rar: "application/x-rar-compressed",
  };

  return extension && map[extension] ? map[extension] : "";
}

function addFile(file: File) {
  const errorMessage = getErrorMessage(file);

  const fileInfo: VcFileType = {
    name: file.name,
    size: file.size,
    mimeType: file.type,
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

function onRemove(file: VcFileType) {
  removeFileFromBrowser(file);
  emit("removeFile", file);
}

function removeFileFromBrowser(file: VcFileType) {
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

  @apply flex flex-col gap-x-6 gap-y-4;

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
