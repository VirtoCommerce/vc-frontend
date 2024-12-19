<template>
  <div :class="{ 'bg-neutral-200': !roleId || fallback }" class="size-[34px] rounded-full">
    <VcImage v-if="roleId" height="34" width="34" :src="`role-${roleId}.svg`" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface IProps {
  roleId?: string;
}

const props = defineProps<IProps>();

const fallback = ref(false);

watch(
  () => props.roleId,
  () => (fallback.value = false),
);
</script>
