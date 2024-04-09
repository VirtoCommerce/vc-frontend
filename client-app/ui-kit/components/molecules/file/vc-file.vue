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

    <span class="vc-file__details">
      <span class="vc-file__row">
        <span v-if="isAttachedFile(file) || isUploadedFile(file)" class="vc-file__link" @click="downloadFile(file)">
          {{ file.name }}
        </span>
        <span v-else class="vc-file__name">
          {{ file.name }}
        </span>

        <span class="vc-file__size">
          {{
            $n(fileSize.value, "decimal", {
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
        :class="{ invisible: !reloadable }"
        variant="no-background"
        color="accent"
        size="xs"
        icon="reset"
        @click="reload"
      />

      <VcButton v-if="removable" variant="no-background" color="neutral" size="xs" icon="x" @click="remove" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ContentType } from "@/core/enums";
import { generateLinkAndDownloadFile } from "@/shared/files";
import { getFileSize, isAttachedFile, isFailedFile, isUploadingFile, isUploadedFile } from "@/ui-kit/utilities";

interface IEmits {
  (event: "reload", value: FileType): void;
  (event: "remove", value: FileType): void;
}

interface IProps {
  file: FileType;
  reloadable?: boolean;
  removable?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

function reload() {
  emit("reload", props.file);
}

function remove() {
  emit("remove", props.file);
}

async function downloadFile(file: FileType) {
  if (file && file.url) {
    await generateLinkAndDownloadFile(file.url, file.name);
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
  @apply flex items-start gap-2 min-h-[2.375rem];

  &__icon {
    @apply flex-none w-8 h-8;

    &--loading {
      @apply opacity-50;
    }
  }

  &__details {
    @apply grow flex flex-col gap-1 w-0;
  }

  &__row {
    @apply flex gap-2 justify-between;
  }

  &__link {
    @apply text-[color:var(--color-link)] cursor-pointer;
  }

  &__name,
  &__link {
    @apply grow line-clamp-2 break-words text-sm font-bold;
  }

  &__size {
    @apply flex-none pt-0.5 text-xs text-[--color-neutral-400];
  }

  &__progress {
    @apply overflow-hidden h-1 rounded-xl bg-[--color-neutral-200];
  }

  &__progress-value {
    @apply h-full rounded-xl bg-[--color-accent-400] transition-all;
  }

  &__message {
    @apply text-xxs text-[--color-neutral-600];

    &--error {
      @apply text-[--color-danger-500];
    }
  }

  &__buttons {
    @apply flex-none flex -mt-1;
  }
}
</style>
