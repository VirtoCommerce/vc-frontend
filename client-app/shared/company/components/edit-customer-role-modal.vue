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
      <div class="flex grow items-center justify-between gap-16">
        <VcButton :disabled="loading" color="secondary" variant="outline" full-width @click="close">
          {{ $t("common.buttons.cancel") }}
        </VcButton>

        <VcButton
          full-width
          :disabled="!corporateContactWithRole || selectedRoleId === roleId"
          :loading="loading"
          @click="$emit('confirm', { userId: contact.securityAccounts![0].id, roleIds: [selectedRoleId] })"
        >
          {{ $t("common.buttons.save") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { VcPopup, VcRadioButton } from "@/ui-kit/components";
import RoleIcon from "./role-icon.vue";
import type { ExtendedContactType } from "../types";
import type { InputChangeOrganizationContactRoleType } from "@/core/api/graphql/types";
import type { ExtendedRoleType } from "@/core/types";

defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  contact: ExtendedContactType;
  roles: ExtendedRoleType[];
  loading: boolean;
}

const roleId = props.contact.extended.roles[0]?.id?.slice();

const selectedRoleId = ref<string>(roleId);

const corporateContactWithRole = computed<boolean>(() => !!props.contact.extended?.roles?.length);

interface IEmits {
  (event: "confirm", value: InputChangeOrganizationContactRoleType): void;
}
</script>
