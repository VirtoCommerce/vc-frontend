<template>
  <Teleport to="body">
    <VcLoaderOverlay v-if="reverting" fixed-spinner data-test-id="back-to-operator-loader">
      {{ $t("shared.layout.header.top_header.switching_back") }}
    </VcLoaderOverlay>
  </Teleport>

  <VcPopover
    class="header-account-menu"
    placement="bottom-end"
    :offset-options="10"
    role="menu"
    :aria-label="$t('shared.layout.header.top_header.account_menu_label')"
    shadow
  >
    <template #trigger="{ opened, triggerProps }">
      <button
        type="button"
        class="header-account-menu__trigger"
        :class="{ 'header-account-menu__trigger--opened': opened }"
        :aria-label="$t('shared.layout.header.top_header.account_menu_label')"
        data-test-id="account-button"
        v-bind="triggerProps"
      >
        {{ initials }}
      </button>
    </template>

    <template #content="{ close }">
      <div class="header-account-menu__panel" data-test-id="account-menu">
        <div class="header-account-menu__head">
          <router-link
            to="/account/dashboard"
            class="header-account-menu__identity"
            data-test-id="dashboard-link"
            @click="close"
          >
            <VcIcon name="user-circle" />

            <span class="header-account-menu__name">
              {{ displayName }}
            </span>
          </router-link>

          <VcButton
            :title="$t('shared.layout.header.link_logout')"
            variant="outline"
            color="neutral"
            size="xs"
            data-test-id="sign-out-button"
            icon
            @click="signMeOut"
          >
            <VcIcon name="logout" />
          </VcButton>
        </div>

        <div v-if="organization" class="header-account-menu__org">
          {{ organization.name }}
        </div>

        <button
          v-if="operator"
          type="button"
          class="header-account-menu__row"
          data-test-id="back-to-operator-row"
          @click="onBackToOperator(close)"
        >
          <VcIcon name="arrow-left" />

          <span class="header-account-menu__name">
            {{ backToOperatorLabel }}
          </span>
        </button>

        <TopHeaderOrganizations v-if="isMultiOrganization" @organization-selected="close" />
      </div>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useImpersonate, useSignMeOut, useUser } from "@/shared/account";
import TopHeaderOrganizations from "./top-header-organizations.vue";

const { user, operator, organization, isMultiOrganization } = useUser();
const { signMeOut } = useSignMeOut();
const { reverting, backToOperatorLabel, backToOperator } = useImpersonate();

const displayName = computed(() => user.value.contact?.fullName || user.value.userName);

const initials = computed(() =>
  displayName.value
    .replace(/(\p{L})\p{L}*/gu, "$1")
    .replace(/\P{L}/gu, "")
    .slice(0, 2)
    .toUpperCase(),
);

async function onBackToOperator(close: () => void): Promise<void> {
  close();
  await backToOperator();
}
</script>

<style lang="scss">
.header-account-menu {
  &__trigger {
    @apply grid size-[42px] flex-none cursor-pointer place-items-center rounded-full border-0 text-sm font-bold;

    @apply font-geologica tracking-wide;

    background: color-mix(in srgb, var(--header-bottom-text-color) 12%, transparent);
    color: var(--header-bottom-text-color);
    transition:
      background var(--transition-duration) ease,
      color var(--transition-duration) ease;

    &:hover {
      background: color-mix(in srgb, var(--header-bottom-text-color) 20%, transparent);
    }

    &--opened {
      background: var(--header-bottom-text-color);
      color: var(--header-bottom-bg-color);
    }
  }

  &__panel {
    @apply flex w-64 flex-col;
  }

  &__head {
    @apply flex max-w-full items-center justify-between gap-4 p-3;
  }

  &__identity {
    @apply flex min-w-0 items-center gap-2;

    color: var(--link-color);

    &:hover {
      color: var(--link-hover-color);
    }
  }

  &__name {
    @apply truncate;
  }

  &__org {
    @apply truncate border-t border-neutral-200 px-3 py-2 text-xs italic text-neutral-600;
  }

  &__row {
    @apply flex items-center gap-2 border-t border-neutral-200 p-3 text-start hover:bg-neutral-50;
  }
}
</style>
