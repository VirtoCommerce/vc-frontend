<template>
  <div class="flex justify-right">
    <VcTooltip placement="bottom-end" trigger="click" :y-offset="0" :x-offset="0">
      <template #trigger>
        <VcButton
          class="flex justify-center w-7 p-2 rounded shadow-sm-x-y-button bg-white text-gray-500"
          kind="custom"
          size="sm"
        >
          <i class="fas fa-cog" />
        </VcButton>
      </template>

      <template #content>
        <div class="flex justify-start space-x-6 px-3.5 py-1.5 bg-white rounded shadow-sm-x-y-button">
          <VcButton class="flex justify-start bg-white" kind="custom" size="sm">
            <i class="fas fa-pencil-alt pr-2 text-yellow-500" />
            <div>{{ $t("pages.company.members.buttons.edit_role") }}</div>
          </VcButton>

          <VcButton class="flex justify-start bg-white" kind="custom" size="sm">
            <i class="fas fa-ban pr-2 text-black" />
            <div>{{ $t("pages.company.members.buttons.edit_role") }}</div>
          </VcButton>

          <VcButton
            class="flex justify-start bg-white"
            kind="custom"
            size="sm"
            @click="$emit('deleteContact', contact)"
          >
            <i class="fas fa-times pr-2 text-red-500" />
            <div>{{ $t("pages.company.members.buttons.edit_role") }}</div>
          </VcButton>
        </div>
      </template>
    </VcTooltip>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { OrganizationContactType } from "@/core/types";

defineProps({
  contact: {
    type: Object as PropType<OrganizationContactType>,
    required: true,
  },
});
</script>
