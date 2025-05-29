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

    <div class="vc-file__content">
      <div class="vc-file__main">
        <div class="vc-file__details">
          <div
            :class="[
              'vc-file__row',
              {
                'vc-file__row--pending': isUploadingFile(file) || isFailedFile(file),
              },
            ]"
          >
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
          </div>

          <div v-if="isUploadingFile(file)" class="vc-file__progress">
            <div class="vc-file__progress-value" :style="{ width: `${file.progress || 0}%` }"></div>
          </div>
        </div>

        <div v-if="removable || reloadable" class="vc-file__buttons">
          <VcButton
            v-if="reloadable"
            :class="{ invisible: !reloadable }"
            variant="no-background"
            color="accent"
            size="xxs"
            icon="reset"
            @click="reload"
          />

          <VcButton
            v-if="removable"
            variant="no-background"
            color="neutral"
            size="xxs"
            icon="delete-thin"
            @click="remove"
          />
        </div>
      </div>

      <div
        :class="[
          'vc-file__message',
          {
            'vc-file__message--error': isFailedFile(file),
          },
        ]"
      >
        <span v-if="isUploadingFile(file)">
          {{ $t("ui_kit.file.progress", { percent: $n(file.progress / 100, { style: "percent" }) }) }}
        </span>

        <span v-else-if="isUploadedFile(file)">
          {{ $t("ui_kit.file.uploaded") }}
        </span>

        <span v-else-if="isFailedFile(file)">
          {{ file.errorMessage }}
        </span>

        <span class="vc-file__size">
          ({{
            $n(fileSize.value, {
              notation: "compact",
              style: "unit",
              unit: fileSize.unit,
              unitDisplay: "narrow",
            })
          }})
        </span>
      </div>
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
    fileName = ContentType[contentType as ContentType]?.replace("/", "-") || "file";
  } else {
    fileName = "file";
  }

  return `file-${fileName}.svg`;
});

const fileSize = computed(() => getFileSize(props.file.size));
</script>

<style lang="scss">
.vc-file {
  --link-color: var(--vc-file-link-color, theme("colors.accent.600"));
  --link-hover-color: var(--vc-file-link-hover-color, theme("colors.accent.700"));

  @apply flex items-center gap-2 min-h-[2.275rem];

  &__icon {
    @apply flex-none w-8 h-8 self-start;

    &--loading {
      @apply opacity-50;
    }
  }

  &__content {
    @apply flex flex-col gap-1 grow min-w-0;
  }

  &__main {
    @apply grow flex items-center gap-2;
  }

  &__details {
    @apply grow flex flex-col gap-1;
  }

  &__row {
    @apply flex gap-2 justify-between items-center;

    &--pending {
      @apply opacity-50;
    }
  }

  &__link {
    @apply text-[--link-color] cursor-pointer;

    &:hover {
      @apply text-[--link-hover-color];
    }
  }

  &__name,
  &__link {
    @apply grow line-clamp-2 text-sm/4 font-bold [word-break:break-word];
  }

  &__progress {
    @apply overflow-hidden h-1 rounded-xl bg-neutral-200;
  }

  &__progress-value {
    @apply h-full rounded-xl bg-accent-400 transition-all;
  }

  &__message {
    @apply text-xxs text-neutral-600 [word-break:break-word];

    &--error {
      @apply text-danger;
    }
  }

  &__text {
    @apply [word-break:break-all];
  }

  &__size {
    @apply flex-none inline-block text-neutral-400;

    &:not(:first-child) {
      @apply ml-1;
    }
  }

  &__buttons {
    --vc-icon-color: theme("colors.neutral.400");

    @apply flex-none flex self-center;
  }
}
</style>
