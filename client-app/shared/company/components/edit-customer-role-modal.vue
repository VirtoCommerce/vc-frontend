<template>
  <VcModal :title="$t('common.titles.change_role')" dividers>
    <div class="space-y-4">
      <div v-for="role in roles" :key="role.id" class="flex items-start gap-2">
        <div class="pt-0.5">
          <VcRadioButton v-model="selectedRoleId" :value="role.id" />
        </div>
        <div class="grow">
          <b>{{ role.name }}</b>
          <div v-if="role.description">
            {{ role.description }}
          </div>
        </div>
        <div class="pt-0.5">
          <RoleIcon :role-id="role.id" />
        </div>
      </div>
    </div>

    <template #actions="{ close }">
      <VcButton min-width="8rem" :disabled="loading" color="secondary" variant="outline" @click="close">
        {{ $t("common.buttons.cancel") }}
      </VcButton>

      <VcButton
        :disabled="selectedRoleId === currentRoleId"
        :loading="loading"
        min-width="8rem"
        class="ms-auto"
        @click="$emit('confirm', selectedRoleId)"
      >
        {{ $t("common.buttons.save") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import RoleIcon from "./role-icon.vue";
import type { ExtendedRoleType } from "@/core/types";

interface IEmits {
  (event: "confirm", value: string): void;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  currentRoleId: string;
  roles: ExtendedRoleType[];
  loading: boolean;
}

const _selectedRoleId = ref<string>();
const selectedRoleId = computed({
  get: () => _selectedRoleId.value ?? props.currentRoleId,
  set: (value) => (_selectedRoleId.value = value),
});
</script>
