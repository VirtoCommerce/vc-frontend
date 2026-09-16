<template>
  <VcModal
    ref="modalComponent"
    :title="$t('return_cancel.title')"
    variant="danger"
    icon="warning"
    class="cancel-return-modal"
    dividers
  >
    <p class="cancel-return-modal__text">{{ $t("return_cancel.text", [returnNumber]) }}</p>

    <VcTextarea
      v-model="reason"
      :label="$t('return_cancel.reason_label')"
      :placeholder="$t('common.placeholders.enter_value')"
      :disabled="loading"
      :max-length="1000"
      rows="3"
    />

    <template #actions="{ close }">
      <VcButton :disabled="loading" color="secondary" variant="outline" @click="close">
        {{ $t("return_cancel.keep_button") }}
      </VcButton>

      <VcButton :loading="loading" color="danger" @click="onConfirm">
        {{ $t("return_cancel.confirm_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { useCancelReturn } from "@/modules/returns/composables/useCancelReturn";
import { VcModal } from "@/ui-kit/components";

interface IProps {
  returnId: string;
  returnNumber: string;
}

interface IEmits {
  (event: "result"): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { loading, cancelReturn } = useCancelReturn();

const modalComponent = useTemplateRef<InstanceType<typeof VcModal>>("modalComponent");
const reason = ref("");

async function onConfirm(): Promise<void> {
  if (!(await cancelReturn(props.returnId, reason.value.trim()))) {
    // The return is still open — leave the modal up so the buyer sees the error against it.
    return;
  }

  modalComponent.value?.close();
  emit("result");
}
</script>

<style lang="scss">
.cancel-return-modal {
  &__text {
    @apply mb-4 text-sm text-neutral-500;
  }
}
</style>
