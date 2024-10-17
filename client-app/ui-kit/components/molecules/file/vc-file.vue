<template>
  <div class="vc-file">
    <VcImage
      :src="icon"
      :class="[
        'vc-file__icon',
        {
          'vc-file__icon--loading': isUploadingFile(file),
        },
      ]"
    />

    <div class="vc-file__main">
      <span class="vc-file__details">
        <span class="vc-file__row">
          <a
            v-if="isAttachedFile(file) || isUploadedFile(file)"
            class="vc-file__link"
            :target="nativeDownload ? '_blank' : ''"
            :href="file.url"
            :download="file.name"
            @click="onFileDownloadClick"
          >
            {{ file.name }}
          </a>

          <span v-else class="vc-file__name">
            {{ file.name }}
          </span>

          <span class="vc-file__size">
            {{
              $n(fileSize.value, {
                notation: "compact",
                style: "unit",
                unit: fileSize.unit,
                unitDisplay: "narrow",
              })
            }}
          </span>
        </span>

        <template v-if="isUploadingFile(file)">
          <div class="vc-file__progress">
            <div class="vc-file__progress-value" :style="{ width: `${file.progress || 0}%` }"></div>
          </div>

          <span class="vc-file__message">
            {{ $t("ui_kit.file.progress", { percent: $n(file.progress / 100, { style: "percent" }) }) }}
          </span>
        </template>

        <span v-else-if="isUploadedFile(file)" class="vc-file__message">{{ $t("ui_kit.file.uploaded") }}</span>

        <span v-else-if="isFailedFile(file)" class="vc-file__message vc-file__message--error">
          {{ file.errorMessage }}
        </span>
      </span>

      <span class="vc-file__buttons">
        <VcButton
          v-if="reloadable || removable"
          :class="{ invisible: !reloadable }"
          variant="no-background"
          color="accent"
          size="xs"
          icon="reset"
          @click="reload"
        />

        <VcButton
          v-if="removable"
          variant="no-background"
          color="neutral"
          size="xs"
          icon="delete-thin"
          @click="remove"
        />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ContentType } from "@/core/enums";
import { getFileSize, isAttachedFile, isFailedFile, isUploadingFile, isUploadedFile } from "@/ui-kit/utilities";

interface IEmits {
  (event: "reload", value: FileType): void;
  (event: "remove", value: FileType): void;
  (event: "download", value: FileType): void;
}

interface IProps {
  file: FileType;
  reloadable?: boolean;
  removable?: boolean;
  nativeDownload?: boolean;
  outline?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

function reload() {
  emit("reload", props.file);
}

function remove() {
  emit("remove", props.file);
}

function onFileDownloadClick(e: Event) {
  if (!props.nativeDownload) {
    e.preventDefault();
    emit("download", props.file);
  }
}

const icon = computed(() => {
  let fileName: string;

  const contentType = props.file.contentType;

  if (isFailedFile(props.file)) {
    fileName = "error";
  } else if (Object.keys(ContentType).includes(contentType as ContentType)) {
    fileName = ContentType[contentType as ContentType] || "file";
  } else {
    fileName = "file";
  }

  return `/static/icons/file/${fileName}.svg`;
});

const fileSize = computed(() => getFileSize(props.file.size));
</script>

<style lang="scss">
.vc-file {
  @apply flex items-center gap-2 min-h-[2.375rem];

  &__icon {
    @apply flex-none w-8 h-8;

    &--loading {
      @apply opacity-50;
    }
  }

  &__main {
    @apply grow flex items-center gap-2;
  }

  &__details {
    @apply grow;
  }

  &__row {
    @apply flex gap-2 justify-between items-center;
  }

  &__link {
    @apply text-[--link-color] cursor-pointer break-all;

    &:hover {
      @apply text-[--link-hover-color];
    }
  }

  &__name,
  &__link {
    @apply grow line-clamp-2 break-words text-sm font-bold;
  }

  &__size {
    @apply flex-none pt-0.5 text-xs text-neutral-400;
  }

  &__progress {
    @apply overflow-hidden h-1 rounded-xl bg-neutral-200;
  }

  &__progress-value {
    @apply h-full rounded-xl bg-accent-400 transition-all;
  }

  &__message {
    @apply text-xxs text-neutral-600;

    &--error {
      @apply text-danger;
    }
  }

  &__buttons {
    @apply flex-none flex self-start;
  }
}
</style>
