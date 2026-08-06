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
        <template v-if="contactStatus === ContactStatus.Invited">
          <VcMenuItem color="secondary" @click="$emit('resendInvite')">
            <VcIcon name="reset" />

            <span>{{ $t("pages.company.members.buttons.resend_invite") }}</span>
          </VcMenuItem>

          <VcMenuItem color="secondary" @click="$emit('revokeInvite')">
            <VcIcon name="delete-2" class="text-danger" />

            <span>{{ $t("pages.company.members.buttons.revoke_invite") }}</span>
          </VcMenuItem>
        </template>

        <template v-else>
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
            <VcIcon name="delete-2" class="text-danger" />

            <span>{{ $t("pages.company.members.buttons.delete") }}</span>
          </VcMenuItem>
        </template>
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
  (event: "revokeInvite"): void;
  (event: "resendInvite"): void;
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
