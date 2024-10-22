<template>
  <div :class="['w-20 rounded-sm px-2.5 py-0.5 text-center md:hidden', memberStatus.styles]">
    {{ $t(memberStatus.label) }}
  </div>

  <VcTooltip class="hidden md:inline-block" width="max-content">
    <template #trigger>
      <img width="20" height="20" :src="memberStatus.icon" :alt="$t(memberStatus.label)" />
    </template>

    <template #content>
      {{ $t(memberStatus.label) }}
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ContactStatus } from "../types";

interface IProps {
  status?: string;
}

const props = defineProps<IProps>();

const memberStatus = computed(() => {
  switch (props.status) {
    case ContactStatus.Approved:
      return {
        icon: "/static/icons/contact-active.svg",
        label: "pages.company.members.statuses.active",
        styles: "bg-success text-additional-50",
      };

    case ContactStatus.Invited:
      return {
        icon: "/static/icons/contact-invited.svg",
        label: "pages.company.members.statuses.invited",
        styles: "bg-info text-additional-50",
      };

    case ContactStatus.Locked:
      return {
        icon: "/static/icons/contact-blocked.svg",
        label: "pages.company.members.statuses.blocked",
        styles: "bg-danger text-additional-50",
      };

    default:
      return {
        icon: "/static/icons/contact-inactive.svg",
        label: "pages.company.members.statuses.inactive",
        styles: "border border-current text-neutral",
      };
  }
});
</script>
