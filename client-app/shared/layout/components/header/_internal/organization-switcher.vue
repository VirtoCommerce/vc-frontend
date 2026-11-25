<template>
  <VcPopover
    v-if="isMultiOrganization"
    class="organization-switcher"
    placement="bottom-end"
    :offset-options="20"
    role="dialog"
    :aria-label="$t('common.labels.organizations')"
    lazy
    shadow
    @toggle="onToggle"
  >
    <template #trigger="{ triggerProps }">
      <BottomHeaderLink
        ref="trigger"
        :link="item"
        type="button"
        :title="organization?.name"
        :aria-labelledby="triggerLabelId"
        data-test-id="organizations-button"
        v-bind="triggerProps"
      >
        {{ item.title }}
      </BottomHeaderLink>

      <!-- BottomHeaderLink names itself by its caption; the name also says whose organization is current. -->
      <span :id="triggerLabelId" hidden>{{ triggerLabel }}</span>
    </template>

    <template #content="{ close }">
      <div class="organization-switcher__panel">
        <OrganizationList :key="openCount" class="organization-switcher__list" @organization-selected="close" />
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { onKeyStroke } from "@vueuse/core";
import { computed, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account/composables/useUser";
import { useComponentId } from "@/ui-kit/composables";
import BottomHeaderLink from "./bottom-header-link.vue";
import OrganizationList from "./organization-list.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {
  item: ExtendedMenuLinkType;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { organization, isMultiOrganization } = useUser();

const triggerLabelId = useComponentId("organization-switcher-label");

// VcPopover keeps closed content mounted: a new key per open refetches the list and drops the last switch error.
const openCount = ref(0);
const isOpen = ref(false);
const trigger = useTemplateRef<InstanceType<typeof BottomHeaderLink>>("trigger");

const triggerLabel = computed(() =>
  organization.value?.name
    ? t("shared.layout.header.organization_switcher.trigger_label", {
        title: props.item.title,
        name: organization.value.name,
      })
    : props.item.title,
);

function onToggle(opened: boolean): void {
  isOpen.value = opened;

  if (opened) {
    openCount.value++;
  }
}

// VcPopover takes Escape only in its panel and on its trigger: from anywhere else, close it through the trigger.
onKeyStroke("Escape", (event: KeyboardEvent) => {
  if (!isOpen.value || event.defaultPrevented) {
    return;
  }

  (trigger.value?.$el as HTMLElement | undefined)?.click();
});
</script>

<style lang="scss">
.organization-switcher {
  --vc-popover-bg-color: var(--color-neutral-50);

  &__panel {
    // Clips the search strip and the rows to the popover's corners.
    @apply w-64 overflow-hidden rounded-[inherit] text-sm text-additional-950;
  }
}
</style>
