<template>
  <div
    :class="[
      'vc-file-picker',
      {
        'vc-file-picker--disabled': disabled,
      },
    ]"
  >
    <input
      ref="fileInputRef"
      type="file"
      class="vc-file-picker__input"
      :multiple="maxFileCount > 1"
      :accept="allowedExtensions?.join(',')"
      @input="onFileChange"
    />

    <slot name="custom" :open-file-picker="openFilePicker" :on-file-drop="onFileDrop" :disabled="disabled" />

    <button
      v-if="!$slots.custom"
      type="button"
      class="vc-file-picker__drop"
      :disabled="disabled"
      @dragover.prevent
      @dragenter.prevent
      @drop="onFileDrop"
      @click="openFilePicker"
    >
      <span class="vc-file-picker__drop-area">
        <slot>
          <VcIcon class="vc-file-picker__icon" name="cloud-upload" size="lg" />

          <span class="vc-file-picker__desktop">
            {{ $t("ui_kit.file_uploader.drag_and_drop") }}
          </span>

          <VcButton color="secondary" size="xs" tag="span">
            {{ $t("ui_kit.file_uploader.browse") }}
          </VcButton>
        </slot>
      </span>

      <span v-if="requirements" v-html-safe="requirements" class="vc-file-picker__requirements" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface IProps {
  maxFileCount: number;
  maxFileSize: number;
  allowedExtensions: Readonly<string[]>;
  files: FileType[];
  requirements?: string;
  disabled?: boolean;
}

interface IEmits {
  (event: "addFiles", items: INewFile[]): void;
}

const emit = defineEmits<IEmits>();

defineProps<IProps>();

const fileInputRef = ref<HTMLInputElement>();

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

function addFiles(items: File[]) {
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
</script>

<style lang="scss">
.vc-file-picker {
  &--disabled {
    @apply opacity-40 pointer-events-none;
  }

  &__input {
    @apply hidden;
  }

  &__drop {
    @apply flex flex-col h-full w-full;
  }

  &__drop-area {
    @apply flex-1 flex flex-col min-h-17 justify-center items-center gap-2 w-full rounded border border-dashed border-secondary-200 p-4 bg-secondary-50;
  }

  &__droppable {
    @apply hidden;

    @media (hover: hover) {
      @apply block text-sm text-neutral-900;

      & > span {
        @apply text-accent font-bold;
      }
    }
  }

  &__icon {
    @apply fill-accent;
  }

  &__requirements {
    @apply mt-1.5 text-xs text-neutral text-start empty:hidden;
  }
}
</style>
