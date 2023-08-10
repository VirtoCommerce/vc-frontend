<template>
  <div :class="{ 'bg-gray-200': !roleId || fallback }" class="h-[34px] w-[34px] rounded-full">
    <svg v-if="roleId" height="34" width="34">
      <use :href="`/static/images/account/roles/${roleId}.svg#main`" @error="fallback = true" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  roleId: String,
});

const fallback = ref(false);

watch(
  () => props.roleId,
  () => (fallback.value = false),
);
</script>
