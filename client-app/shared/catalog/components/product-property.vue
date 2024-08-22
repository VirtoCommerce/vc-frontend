<template>
  <div class="flex gap-x-3">
    <div class="flex w-1/2 gap-x-3">
      <div class="shrink text-neutral">
        {{ label }}
      </div>

      <div class="border-grey-100 h-5 flex-1 border-b border-dotted"></div>
    </div>

    <div class="line-clamp-3 w-1/2 font-bold">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  label: string;
}

defineProps<IProps>();
</script>
