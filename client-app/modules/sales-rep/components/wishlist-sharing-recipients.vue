<template>
  <div data-test-id="wishlist-sharing-recipients" class="wishlist-sharing-recipients">
    <template v-if="collapsible">
      <div class="wishlist-sharing-recipients__header">
        <span class="wishlist-sharing-recipients__title">
          {{ t("sales_rep.list_sharing.recipients_title", { count: recipients.length }) }}
        </span>

        <VcButton
          data-test-id="wishlist-sharing-clear-recipients-button"
          color="danger"
          variant="ghost"
          size="xs"
          :disabled="disabled"
          @click="$emit('clear')"
        >
          {{ t("sales_rep.list_sharing.clear_recipients_button") }}
        </VcButton>
      </div>

      <div class="wishlist-sharing-recipients__separator"></div>
    </template>

    <ul
      ref="rowsElement"
      class="wishlist-sharing-recipients__rows"
      :aria-label="t('sales_rep.list_sharing.recipients_title', { count: recipients.length })"
    >
      <li v-for="(recipient, index) in visibleRecipients" :key="recipient.organizationId">
        <div class="wishlist-sharing-recipients__row">
          <WishlistSharingAvatar :organization-name="recipient.organizationName" :image-url="recipient.imageUrl" />

          <span class="wishlist-sharing-recipients__meta">
            <span class="wishlist-sharing-recipients__name">{{ recipient.organizationName }}</span>

            <span v-if="recipient.location" class="wishlist-sharing-recipients__location">
              {{ recipient.location }}
            </span>
          </span>

          <VcButton
            :data-test-id="`wishlist-sharing-remove-recipient-${recipient.organizationId}`"
            :aria-label="t('sales_rep.list_sharing.remove_recipient_button', { name: recipient.organizationName })"
            :size="isMobile ? 'xs' : 'sm'"
            :disabled="disabled"
            color="secondary"
            variant="ghost"
            icon="trash-2"
            class="wishlist-sharing-recipients__remove"
            @click="requestRemove(recipient.organizationId, index)"
          />
        </div>
      </li>
    </ul>

    <!-- Sticky so collapsing never means scrolling past every row first; inert when the content fits. -->
    <div v-if="collapsible" class="wishlist-sharing-recipients__toggle">
      <div class="wishlist-sharing-recipients__separator"></div>

      <div class="wishlist-sharing-recipients__toggle-bar">
        <VcButton
          data-test-id="wishlist-sharing-toggle-recipients-button"
          :append-icon="expanded ? 'chevron-up' : 'chevron-down'"
          color="primary"
          variant="ghost"
          size="sm"
          icon-size="1.25rem"
          @click="expanded = !expanded"
        >
          {{
            expanded
              ? t("sales_rep.list_sharing.show_less_recipients_button")
              : t("sales_rep.list_sharing.show_all_recipients_button", { count: recipients.length })
          }}
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { BREAKPOINTS } from "@/ui-kit/constants";
import WishlistSharingAvatar from "./wishlist-sharing-avatar.vue";
import type { WishlistSharingRecipientType } from "../types";

interface IEmits {
  (event: "remove", organizationId: string): void;
  (event: "clear"): void;
}

interface IProps {
  recipients: WishlistSharingRecipientType[];
  disabled?: boolean;
  /** How many rows are shown before the list offers to expand. */
  collapsedRows?: number;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), { collapsedRows: 3 });

const { t } = useI18n();

const isMobile = useBreakpoints(BREAKPOINTS).smaller("md");

const rowsElement = useTemplateRef<HTMLElement>("rowsElement");

const expanded = ref(false);

const collapsible = computed(() => props.recipients.length > props.collapsedRows);

const visibleRecipients = computed(() =>
  collapsible.value && !expanded.value ? props.recipients.slice(0, props.collapsedRows) : props.recipients,
);

// The deleted row takes the focus with it. Nowhere to send it once the list empties: the block unmounts, and
// `VcSelect` exposes no focus method.
async function requestRemove(organizationId: string, index: number): Promise<void> {
  emit("remove", organizationId);

  await nextTick();

  const buttons = rowsElement.value?.querySelectorAll<HTMLElement>(".wishlist-sharing-recipients__remove");

  buttons?.[Math.min(index, buttons.length - 1)]?.focus();
}

// Shrinking below the threshold would otherwise strand the list expanded with no toggle to collapse it.
watch(collapsible, (isCollapsible) => {
  if (!isCollapsible) {
    expanded.value = false;
  }
});
</script>

<style lang="scss">
.wishlist-sharing-recipients {
  // `clip`, not `hidden`: `hidden` makes this a scroll container and breaks the sticky toggle.
  @apply flex flex-col rounded-lg border border-neutral-200 bg-additional-50 overflow-clip;

  &__header {
    @apply flex items-center gap-2 min-h-10 ps-3 pe-1.5 py-1;
  }

  &__title {
    @apply min-w-0 grow text-sm font-bold text-neutral-950;
  }

  &__separator {
    @apply h-px bg-neutral-200;
  }

  &__rows {
    @apply divide-y divide-neutral-100;
  }

  &__row {
    @apply flex items-center gap-3 px-3 py-2;
  }

  &__meta {
    @apply flex min-w-0 grow flex-col;
  }

  &__name {
    @apply truncate text-sm/[18px] font-bold text-neutral-950;
  }

  &__location {
    @apply truncate text-sm/[18px] text-neutral-800;
  }

  &__toggle {
    @apply sticky bottom-0 bg-additional-50;
  }

  &__toggle-bar {
    @apply flex justify-center py-0.5;
  }
}
</style>
