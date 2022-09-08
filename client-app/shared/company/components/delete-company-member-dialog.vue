<template>
  <VcPopup
    :title="$t('shared.company.delete_member_dialog.title')"
    modal-width="sm:max-w-[30rem]"
    variant="danger"
    hide-actions
  >
    <template #default="{ close }">
      <div class="flex flex-row items-center justify-center px-6 py-10 space-x-4">
        <div class="flex shrink-0 items-center justify-center w-11 h-11 rounded-full bg-[color:var(--color-danger)]">
          <svg width="6" height="23" class="text-white">
            <use href="/static/images/exclamation.svg#main" />
          </svg>
        </div>

        <p class="lg:font-semibold lg:text-lg leading-snug">
          {{
            $t("shared.company.delete_member_dialog.text", {
              name: `${contact.fullName} (${contact.extended.emails[0]})`,
            })
          }}
        </p>
      </div>

      <div class="flex flex-row justify-center px-6 pb-10 space-x-4">
        <VcButton :is-waiting="loading" class="uppercase w-36" @click="$emit('confirm')">
          {{ $t("common.buttons.ok") }}
        </VcButton>

        <VcButton class="uppercase w-36" kind="secondary" is-outline @click="close">
          {{ $t("common.buttons.cancel") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { ExtendedContactType } from "@/shared/company";

defineEmits(["confirm"]);

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },

  contact: {
    type: Object as PropType<ExtendedContactType>,
    required: true,
  },
});
</script>
