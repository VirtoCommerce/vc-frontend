<template>
  <VcChip v-if="chip" :color="memberStatus.color" variant="outline" size="sm" rounded nowrap>
    {{ $t(memberStatus.label) }}
  </VcChip>

  <template v-else>
    <div :class="['w-20 rounded-sm px-2.5 py-0.5 text-center md:hidden', memberStatus.styles]">
      {{ $t(memberStatus.label) }}
    </div>

    <VcTooltip class="hidden md:inline-block" width="max-content">
      <template #trigger>
        <VcImage width="20" height="20" :src="memberStatus.icon" :alt="$t(memberStatus.label)" />
      </template>

      <template #content>
        {{ $t(memberStatus.label) }}
      </template>
    </VcTooltip>
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ContactStatus } from "../types";

interface IProps {
  status?: string;
  /** Renders the status as an outlined chip at every width (record cards). */
  chip?: boolean;
}

interface IMemberStatusView {
  icon: string;
  label: string;
  color: VcChipColorType;
  styles: string;
}

const props = defineProps<IProps>();

const INACTIVE_STATUS_VIEW: IMemberStatusView = {
  icon: "status-inactive.svg",
  label: "pages.company.members.statuses.inactive",
  color: "neutral",
  styles: "border border-current text-neutral",
};

const STATUS_VIEWS: Partial<Record<string, IMemberStatusView>> = {
  [ContactStatus.Approved]: {
    icon: "status-active.svg",
    label: "pages.company.members.statuses.active",
    color: "success",
    styles: "bg-success text-additional-50",
  },
  [ContactStatus.Invited]: {
    icon: "status-invited.svg",
    label: "pages.company.members.statuses.invited",
    color: "info",
    styles: "bg-info text-additional-50",
  },
  [ContactStatus.Locked]: {
    icon: "status-blocked.svg",
    label: "pages.company.members.statuses.blocked",
    color: "danger",
    styles: "bg-danger text-additional-50",
  },
};

const memberStatus = computed<IMemberStatusView>(() => STATUS_VIEWS[props.status ?? ""] ?? INACTIVE_STATUS_VIEW);
</script>
