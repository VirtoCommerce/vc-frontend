<template>
  <div class="organization-list">
    <VcAlert v-if="switchError" class="organization-list__error" color="danger" size="sm" variant="tonal" icon>
      {{ switchError }}
    </VcAlert>

    <div v-if="!isShowSearch" class="organization-list__label organization-list__label--static">
      {{ $t("common.labels.organizations") }}
    </div>

    <div v-else class="organization-list__search">
      <div class="organization-list__label">
        {{ $t("common.labels.organizations") }}
      </div>

      <VcInput
        v-model="searchPhrase"
        type="search"
        size="sm"
        data-test-id="organizations-search"
        :placeholder="$t('shared.layout.header.top_header.search_organizations')"
        :aria-label="$t('shared.layout.header.top_header.search_organizations')"
        :clearable="!!searchPhrase"
        :aria="{ 'aria-controls': listboxId }"
        @keydown.enter="search"
        @keydown.down.prevent="list?.focus()"
        @input="onSearchInput"
        @clear="onSearchClear"
      >
        <template #append>
          <VcButton
            icon="search"
            icon-size="1.25rem"
            :aria-label="$t('shared.layout.header.top_header.search_organizations')"
            data-test-id="organizations-search-button"
            @click="search"
          />
        </template>
      </VcInput>
    </div>

    <div class="organization-list__items">
      <VcMenuList
        :id="listboxId"
        ref="list"
        role="listbox"
        :aria-label="$t('common.labels.organizations')"
        class="organization-list__options"
      >
        <VcScrollbar vertical class="organization-list__scroll" test-id="organizations-list">
          <VcMenuItem
            v-for="item in displayedOrganizations"
            :key="item.id"
            size="xs"
            class="organization-list__item"
            :active="contactOrganizationId === item.id"
            :data-vc-organization-option="componentId"
            :disabled="item.isLockedForCurrentUser"
            :title="
              item.isLockedForCurrentUser
                ? $t('shared.layout.header.top_header.organization_locked_tooltip')
                : undefined
            "
            @click="selectOrganization(item.id)"
          >
            <VcRadioButton
              :model-value="contactOrganizationId"
              :label="item.name"
              :value="item.id"
              :max-lines="2"
              :title="item.name"
              word-break="break-word"
              :data-organization-name="item.name"
              :disabled="item.isLockedForCurrentUser"
            />

            <template v-if="item.isLockedForCurrentUser" #append>
              <VcIcon name="lock-closed" size="xs" />
            </template>
          </VcMenuItem>

          <VcInfinityScrollLoader
            v-if="hasNextPage"
            :loading="loading"
            :page-number="currentPage"
            :pages-count="pagesCount"
            distance="50"
            class="organization-list__loader"
            @visible="loadOrganizations"
          />
        </VcScrollbar>
      </VcMenuList>

      <!-- Outside the listbox (only options belong there) and always rendered, so an empty result is announced. -->
      <output>
        <span
          v-if="organizations.length === 0 && !loading"
          class="organization-list__empty"
          data-test-id="organizations-empty-list"
        >
          {{ $t("shared.layout.header.top_header.no_results") }}
        </span>
      </output>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import { useOrganizationSwitcher } from "@/shared/account/composables/useOrganizationSwitcher";
import { useUser } from "@/shared/account/composables/useUser";
import { useUserOrganizations } from "@/shared/account/composables/useUserOrganizations";
import { useComponentId } from "@/ui-kit/composables";

interface IEmits {
  (event: "organizationSelected"): void;
}

const emit = defineEmits<IEmits>();

const SEARCH_DEBOUNCE_MS = 300;

const { user, organization } = useUser();
const {
  searchPhrase,
  organizations,
  loading,
  hasNextPage,
  pagesCount,
  currentPage,
  loadOrganizations,
  search,
  isShowSearch,
} = useUserOrganizations();
const { switchError, trySwitch } = useOrganizationSwitcher();

const contactOrganizationId = ref(user.value?.contact?.organizationId);

// Keep the radio selection in sync with the actual active organization so a failed/abandoned switch
// can't leave the optimistic value stale (clicking the current org early-returns without re-syncing).
watch(
  () => user.value?.contact?.organizationId,
  (organizationId) => {
    contactOrganizationId.value = organizationId;
  },
);

const componentId = useComponentId("organizations");
const listboxId = componentId + "-listbox";
const list = useTemplateRef("list");

// Shared session state: refetch on each mount so a newly locked row is disabled, and drop the last phrase.
onMounted(() => {
  searchPhrase.value = "";
  void search();
});

const displayedOrganizations = computed(() => {
  const withoutCurrent = organizations.value.filter((item) => item.id !== organization.value?.id);

  if (organization.value && !loading.value && organizations.value.length > 0) {
    return [organization.value, ...withoutCurrent];
  }

  return withoutCurrent;
});

async function selectOrganization(organizationId: string): Promise<void> {
  if (!organizationId) {
    return;
  }

  if (organizationId === organization.value?.id) {
    emit("organizationSelected");
    return;
  }

  const target = organizations.value.find((item) => item.id === organizationId);
  if (target?.isLockedForCurrentUser) {
    return;
  }

  contactOrganizationId.value = organizationId;

  const succeeded = await trySwitch(organizationId);

  if (!succeeded) {
    contactOrganizationId.value = user.value?.contact?.organizationId;
    return;
  }

  emit("organizationSelected");
}

const debouncedSearch = useDebounceFn(search, SEARCH_DEBOUNCE_MS);

async function onSearchInput(): Promise<void> {
  if (!searchPhrase.value.trim()) {
    await search();
  } else {
    void debouncedSearch();
  }
}

// Not reset(): it zeroes the total, which hides the search block and drops focus out of the dialog.
async function onSearchClear(): Promise<void> {
  searchPhrase.value = "";
  await search();
}
</script>

<style lang="scss">
.organization-list {
  &__error {
    @apply m-2;
  }

  &__search {
    @apply border-b bg-neutral-100 p-3 pt-2;
  }

  &__label {
    @apply pb-1 text-xs text-neutral-600;

    &--static {
      @apply px-3 pt-3;
    }
  }

  &__items {
    @apply my-1;
  }

  &__scroll {
    @apply max-h-60;
  }

  &__loader {
    @apply py-2;
  }

  &__empty {
    @apply block px-3 py-2 text-center text-neutral-600;
  }
}
</style>
