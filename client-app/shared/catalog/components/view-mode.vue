<template>
  <div class="space-x-2" role="group">
    <button
      type="button"
      class="flex rounded p-2"
      :class="[
        mode === 'grid'
          ? 'cursor-auto bg-additional-50 text-neutral-700 hover:shadow-md'
          : 'text-primary hover:text-primary-600',
      ]"
      @click="$emit('update:mode', 'grid')"
    >
      <VcIcon class="size-5" name="grid" />

      <span class="ml-1.5 hidden text-base font-bold lg:block">{{ $t("shared.catalog.view_mode.grid_label") }}</span>
    </button>

    <button
      type="button"
      class="flex rounded p-2"
      :class="[
        mode === 'list'
          ? 'cursor-auto bg-additional-50 text-neutral-700 hover:shadow-md'
          : 'text-primary hover:text-primary-600',
      ]"
      @click="$emit('update:mode', 'list')"
    >
      <VcIcon class="size-5" name="list" />

      <span class="ml-1.5 hidden text-base font-bold lg:block">{{ $t("shared.catalog.view_mode.list_label") }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "update:mode", mode: string): void;
}

interface IProps {
  mode?: string;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  mode: "grid",
});
</script>
