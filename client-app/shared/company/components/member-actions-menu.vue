<template>
  <div class="flex justify-right">
    <VcTooltip placement="bottom-end" trigger="click" :y-offset="0" :x-offset="0">
      <template #trigger>
        <div class="flex justify-center w-7 p-2 rounded shadow-sm-x-y-button cursor-pointer">
          <img width="14" height="14" src="/static/icons/contact-actions.svg" />
        </div>
      </template>

      <template #content>
        <div class="flex justify-start space-x-6 p-3.5 bg-white rounded shadow-sm-x-y-button">
          <div class="flex justify-start space-x-2 cursor-pointer">
            <img width="15" height="15" src="/static/icons/contact-edit-role.svg" />
            <div>{{ $t("pages.company.members.buttons.edit_role") }}</div>
          </div>

          <div class="flex justify-start space-x-2 cursor-pointer">
            <img width="15" height="15" src="/static/icons/contact-block.svg" />
            <div>{{ $t("pages.company.members.buttons.block_user") }}</div>
          </div>

          <div class="flex justify-start space-x-2 cursor-pointer" @click="$emit('deleteContact', contact)">
            <img width="15" height="15" src="/static/icons/contact-delete.svg" />
            <div>{{ $t("pages.company.members.buttons.delete") }}</div>
          </div>
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
