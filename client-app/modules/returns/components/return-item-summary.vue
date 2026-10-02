<template>
  <div>
    <div>{{ item.name }}</div>

    <div class="text-sm text-neutral-400">
      {{ [item.sku, item.measureUnit].filter(Boolean).join(" · ") }}
    </div>

    <div v-if="item.reasonComment" class="text-sm text-neutral-400">{{ item.reasonComment }}</div>

    <div v-if="item.rejectReason" class="mt-1 text-sm">
      <div class="text-neutral-400">{{ $t("return_details.reject_reason") }}</div>

      <div class="text-danger-700">{{ item.rejectReason }}</div>
    </div>

    <ul v-if="item.files.length" class="mt-2 space-y-1">
      <li v-for="file in item.files" :key="file.url">
        <VcFile :file="file" @download="$emit('download', file)" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  item: {
    name?: string;
    sku?: string;
    measureUnit?: string;
    reasonComment?: string;
    rejectReason?: string;
    files: IAttachedFile[];
  };
}

interface IEmits {
  (event: "download", file: FileType): void;
}

defineEmits<IEmits>();

defineProps<IProps>();
</script>
