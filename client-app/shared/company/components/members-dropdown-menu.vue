<template>
  <VcDropdownMenu :y-offset="4" :x-offset="0" :placement="placement">
    <template #trigger="{ triggerProps }">
      <VcButton
        :aria-label="$t('common.labels.actions')"
        icon="cog"
        color="secondary"
        variant="outline"
        size="xs"
        v-bind="triggerProps"
      />
    </template>

    <template #content>
      <template v-if="canEditOrganization">
        <VcMenuItem color="secondary" @click="$emit('edit')">
          <VcIcon name="edit" />

          <span>{{ $t("pages.company.members.buttons.edit_role") }}</span>
        </VcMenuItem>

        <VcMenuItem
          v-if="contactStatus === ContactStatus.Locked"
          color="secondary"
          @click="$emit('lockOrUnlock', true)"
        >
          <VcIcon name="check" />

          <span>{{ $t("pages.company.members.buttons.unblock_user") }}</span>
        </VcMenuItem>

        <VcMenuItem v-else color="secondary" @click="$emit('lockOrUnlock')">
          <VcIcon name="ban" />

          <span>{{ $t("pages.company.members.buttons.block_user") }}</span>
        </VcMenuItem>

        <VcMenuItem color="secondary" @click="$emit('remove')">
          <VcIcon name="delete-2" class="fill-danger" />

          <span>{{ $t("pages.company.members.buttons.delete") }}</span>
        </VcMenuItem>
      </template>

      <VcMenuItem v-if="canLoginOnBehalf" color="secondary" @click="$emit('loginOnBehalf')">
        <VcIcon name="direct-login" />

        <span>{{ $t("pages.company.members.buttons.login_on_behalf") }}</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
import { ContactStatus } from "../types";

interface IEmit {
  (event: "edit"): void;
  (event: "remove"): void;
  (event: "lockOrUnlock", isUnlock?: boolean): void;
  (event: "loginOnBehalf"): void;
}

export interface IProps {
  contactStatus?: string;
  placement?: VcPopoverPlacementType;
  canLoginOnBehalf?: boolean;
  canEditOrganization?: boolean;
}

defineEmits<IEmit>();

withDefaults(defineProps<IProps>(), {
  placement: "bottom-end",
  canLoginOnBehalf: false,
  canEditOrganization: false,
});
</script>
