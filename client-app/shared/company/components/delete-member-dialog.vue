<template>
  <VcPopup
    :title="$t('shared.company.delete_member_dialog.title')"
    :hideActions="true"
    class="h-64"
    variant="danger"
    modal-width="sm:max-w-[32rem]"
    ref="popupComponent"
  >
    <div class="flex justify-center py-10 px-8 space-x-4">
      <img width="45" height="45" src="/static/icons/icon-exclamation.svg" />
      <div>
        {{ $t("shared.company.delete_member_dialog.text", { name: `${contact.fullName} (${contact.email})` }) }}
      </div>
    </div>

    <div class="flex justify-center">
      <div class="flex justify-center pb-10 space-x-4">
        <VcButton class="uppercase w-36" @click="$emit('confirm')">
          {{ $t("shared.company.delete_member_dialog.ok_button") }}
        </VcButton>

        <VcButton class="uppercase w-36" kind="secondary" is-outline @click="$emit('close')">
          {{ $t("shared.company.delete_member_dialog.cancel_button") }}
        </VcButton>
      </div>
    </div>
  </VcPopup>
</template>

<script setup lang="ts">
import { OrganizationContactType } from "@/core/types";
import { PropType } from "vue";

defineProps({
  contact: {
    type: Object as PropType<OrganizationContactType>,
    required: true,
  },
});
</script>
