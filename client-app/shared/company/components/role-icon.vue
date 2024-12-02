<template>
  <div :class="{ 'bg-neutral-200': !roleId || fallback }" class="size-[34px] rounded-full">
    <svg v-if="roleId" height="34" width="34">
      <use :href="`/static/images/account/roles/${roleId}.svg#main`" @error="fallback = true" />
    </svg>
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
