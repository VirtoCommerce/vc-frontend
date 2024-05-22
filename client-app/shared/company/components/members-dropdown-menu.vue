<template>
  <VcDropdownMenu :y-offset="4" :x-offset="0" :placement="placement">
    <template #trigger>
      <VcButton icon="cog" color="secondary" variant="outline" size="xs" />
    </template>

    <template #content>
      <VcMenuItem color="secondary" @click="$emit('edit')">
        <VcIcon name="pencil" />

        <span>{{ $t("pages.company.members.buttons.edit_role") }}</span>
      </VcMenuItem>

      <VcMenuItem v-if="contactStatus === ContactStatus.Locked" color="secondary" @click="$emit('lockOrUnlock', true)">
        <VcIcon name="check" />

        <span>{{ $t("pages.company.members.buttons.unblock_user") }}</span>
      </VcMenuItem>

      <VcMenuItem v-else color="secondary" @click="$emit('lockOrUnlock')">
        <VcIcon name="ban" />

        <span>{{ $t("pages.company.members.buttons.block_user") }}</span>
      </VcMenuItem>

      <VcMenuItem color="secondary" @click="$emit('remove')">
        <VcIcon name="delete-2" class="text-[--color-danger-500]" />

        <span>{{ $t("pages.company.members.buttons.delete") }}</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { ContactStatus } from "../types";

interface IEmit {
  (event: "edit"): void;
  (event: "remove"): void;
  (event: "lockOrUnlock", isUnlock?: boolean): void;
}

export interface IProps {
  contactStatus?: string;
  placement?: VcPopoverPlacementType;
}

defineEmits<IEmit>();

const props = withDefaults(defineProps<IProps>(), {
  placement: "bottom-end",
});

const { contactStatus, placement } = toRefs(props);
</script>
