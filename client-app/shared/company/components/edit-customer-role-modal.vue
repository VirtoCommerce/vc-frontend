<template>
  <VcPopup :title="$t('common.titles.change_role')" modal-width="max-w-md">
    <div class="space-y-4 p-6">
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
      <VcButton :disabled="loading" color="secondary" variant="outline" @click="close">
        {{ $t("common.buttons.cancel") }}
      </VcButton>

      <VcButton
        :disabled="selectedRoleId === currentRoleId"
        :loading="loading"
        class="ms-auto"
        @click="$emit('confirm', selectedRoleId)"
      >
        {{ $t("common.buttons.save") }}
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { VcPopup, VcRadioButton } from "@/ui-kit/components";
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
