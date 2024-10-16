<template>
  <div :class="['vc-file-uploader', `vc-file-uploader--view--${view}`]">
    <input
      ref="fileInputRef"
      type="file"
      class="vc-file-uploader__input"
      :multiple="maxFileCount > 1"
      :accept="allowedExtensions?.join(',')"
      @input="onFileChange"
    />

    <div v-if="files?.length" class="vc-file-uploader__list-container">
      <ul class="vc-file-uploader__list">
        <li v-for="(file, index) in files" :key="index">
          <VcFile
            :native-download="nativeDownload"
            :file="file"
            removable
            @remove="onRemove([file])"
            @download="onFileDownload"
          />
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
        <span class="vc-file-uploader__desktop">{{ $t("ui_kit.file_uploader.drag_and_drop") }}</span>
        <VcButton color="secondary" size="xs">{{ $t("ui_kit.file_uploader.browse") }}</VcButton>
      </span>

      <span
        v-html-safe="
          $t('ui_kit.file_uploader.requirements', {
            formats: formatsHint,
            fileSize: fileSizeHint,
            maxFileCount,
          })
        "
        class="vc-file-uploader__description"
      />
    </button>

    <VcAlert
      v-if="hasMaxFileCount || triedMoreThanMaxFileCount"
      class="vc-file-uploader__alert"
      :color="triedMoreThanMaxFileCount ? 'danger' : 'warning'"
      variant="solid-light"
      size="sm"
      icon
    >
      <template v-if="hasMaxFileCount && !triedMoreThanMaxFileCount">
        {{ $t("ui_kit.file_uploader.errors.has_max_file_count") }}
      </template>
      <template v-if="triedMoreThanMaxFileCount">
        {{ $t("ui_kit.file_uploader.errors.tried_more_than_max_file_count") }}
      </template>
    </VcAlert>

    <VcAlert
      v-if="files.some(isFailedFile)"
      class="vc-file-uploader__alert"
      color="danger"
      variant="solid-light"
      size="sm"
      icon
    >
      {{ $t("ui_kit.file_uploader.errors.fix_to_continue") }}
    </VcAlert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getFileSize, isFailedFile } from "@/ui-kit/utilities";

interface IProps {
  maxFileCount: number;
  maxFileSize: number;
  allowedExtensions: Readonly<string[]>;
  view?: "horizontal" | "vertical";
  files: FileType[];
  nativeDownload?: boolean;
}

interface IEmits {
  (event: "addFiles", items: INewFile[]): void;
  (event: "removeFiles", items: FileType[]): void;
  (event: "download", item: FileType): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  view: "horizontal",
});

const { t, n } = useI18n();

const fileInputRef = ref<HTMLInputElement>();

const hasMaxFileCount = computed<boolean>(() => props.files.length === props.maxFileCount);

const triedMoreThanMaxFileCount = ref<boolean>();

const formatsHint = computed(() => {
  if (props.allowedExtensions?.length) {
    return props.allowedExtensions.map((el) => el.replace(/^\./, "").toUpperCase()).join(", ");
  }
  return t("ui_kit.file_uploader.any_format");
});

const fileSizeHint = computed(() => {
  const maxFileSize = getFileSize(props.maxFileSize);
  return n(maxFileSize.value, {
    key: "decimal",
    notation: "compact",
    style: "unit",
    unit: maxFileSize.unit,
    unitDisplay: "narrow",
  });
});

function openFilePicker() {
  fileInputRef.value?.click();
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const fileList = input.files;
  const files = Array.from(fileList!);
  // Cleanup input value to allow reupload
  input.value = "";
  addFiles(files);
}

function onFileDrop(event: DragEvent) {
  event.preventDefault();

  const fileList = event.dataTransfer?.files;
  addFiles(Array.from(fileList!));
}

function onRemove(files: FileType[]) {
  triedMoreThanMaxFileCount.value = undefined;

  removeFiles(files);
}

function addFiles(items: File[]) {
  triedMoreThanMaxFileCount.value = props.files.length + items.length > props.maxFileCount;

  emit(
    "addFiles",
    items.map((item) => {
      return {
        name: item.name,
        size: item.size,
        contentType: item.type,
        progress: 0,
        status: "new",
        file: item,
      };
    }),
  );
}

function removeFiles(items: FileType[]) {
  emit("removeFiles", items);
}

function onFileDownload(file: FileType) {
  emit("download", file);
}
</script>

<style lang="scss">
.vc-file-uploader {
  $horizontal: &;
  $vertical: &;

  @apply flex flex-col gap-x-6 gap-y-4 flex-wrap;

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
    @apply px-3 py-4 border border-neutral-200 rounded;

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
    @apply flex-1 flex flex-col justify-center items-center gap-2 w-full rounded border border-dashed border-secondary-200 p-5;
    @apply bg-secondary-50 #{!important};
  }

  &__drop-icon {
    @apply text-accent;
  }

  &__desktop {
    @apply hidden;

    @media (hover: hover) {
      @apply block text-sm text-neutral-900;

      & > span {
        @apply text-accent font-bold;
      }
    }
  }

  &__description {
    @apply text-xs text-neutral text-start;
  }

  &__alert {
    @apply order-last w-full;
  }
}
</style>
