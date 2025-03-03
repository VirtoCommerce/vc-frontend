<template>
  <div :class="['vc-file-uploader', `vc-file-uploader--view--${view}`]">
    <div class="vc-file-uploader__list-container">
      <ul v-if="files?.length" class="vc-file-uploader__list">
        <li v-for="(file, index) in files" :key="index">
          <VcFile
            :native-download="nativeDownload"
            :file="file"
            :removable="removable"
            @remove="onRemove([file])"
            @download="onFileDownload"
          />
        </li>
      </ul>
    </div>

    <VcFilePicker
      :max-file-count="maxFileCount"
      :max-file-size="maxFileSize"
      :allowed-extensions="allowedExtensions"
      :files="files"
      :requirements="requirements"
      class="vc-file-uploader__drop-container"
      @add-files="addFiles"
    />

    <slot name="after">
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
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { isFailedFile, fileRequirements } from "@/ui-kit/utilities";

interface IProps {
  maxFileCount: number;
  maxFileSize: number;
  allowedExtensions: Readonly<string[]>;
  view?: "horizontal" | "vertical";
  files: FileType[];
  removable?: boolean;
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

const hasMaxFileCount = computed<boolean>(() => props.files.length === props.maxFileCount);

const triedMoreThanMaxFileCount = ref<boolean>();

const requirements = computed(() => fileRequirements(props.allowedExtensions, props.maxFileSize, props.maxFileCount));

function addFiles(items: INewFile[]) {
  triedMoreThanMaxFileCount.value = props.files.length + items.length > props.maxFileCount;

  emit("addFiles", items);
}

function onRemove(files: FileType[]) {
  triedMoreThanMaxFileCount.value = undefined;

  removeFiles(files);
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

  &__list-container {
    @apply px-3 py-4 border border-neutral-200 rounded empty:hidden;

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

  &__file-picker {
    @apply h-full;
  }

  &__alert {
    @apply order-last w-full;
  }
}
</style>
