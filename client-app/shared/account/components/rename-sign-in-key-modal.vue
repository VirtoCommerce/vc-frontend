<template>
  <VcModal :title="$t('pages.account.security.rename_modal.title')" :is-persistent="loading">
    <VcInput
      v-model.trim="name"
      :label="$t('pages.account.security.rename_modal.name_label')"
      :disabled="loading"
      @keydown.enter="save"
    />

    <template #actions="{ close }">
      <VcButton color="secondary" variant="outline" :disabled="loading" @click="close">
        {{ $t("common.buttons.cancel") }}
      </VcButton>

      <VcButton class="ms-auto" :loading="loading" :disabled="!name" @click="save">
        {{ $t("common.buttons.save") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface IEmits {
  (event: "save", name: string): void;
}

interface IProps {
  initialName?: string;
  loading?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const name = ref("");

watch(
  () => props.initialName,
  (initialName) => {
    name.value = initialName ?? "";
  },
  { immediate: true },
);

function save(): void {
  if (name.value) {
    emit("save", name.value);
  }
}
</script>
