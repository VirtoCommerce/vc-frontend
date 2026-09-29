<template>
  <div class="top-header-organizations">
    <VcAlert
      v-if="switchError"
      class="top-header-organizations__error"
      color="danger"
      size="sm"
      variant="outline-dark"
      icon
    >
      {{ switchError }}
    </VcAlert>

    <div v-if="!isShowSearch" class="top-header-organizations__label top-header-organizations__label--static">
      {{ $t("common.labels.organizations") }}
    </div>

    <div v-if="isShowSearch" class="top-header-organizations__search">
      <div class="top-header-organizations__label">
        {{ $t("common.labels.organizations") }}
      </div>

      <VcInput
        v-model="searchPhrase"
        type="search"
        size="sm"
        data-test-id="organizations-search"
        :placeholder="$t('common.labels.search')"
        :clearable="!!searchPhrase"
        :aria="{
          role: 'combobox',
          'aria-expanded': 'true',
          'aria-haspopup': 'listbox',
          'aria-controls': listboxId,
          'aria-activedescendant': activeDescendantId ?? null,
        }"
        @keydown.enter="onEnter"
        @keydown.down.prevent="navigate('down')"
        @keydown.up.prevent="navigate('up')"
        @input="onSearchInput"
        @clear="onSearchClear"
      >
        <template #append>
          <VcButton icon="search" icon-size="1.25rem" data-test-id="organizations-search-button" @click="onSearch" />
        </template>
      </VcInput>
    </div>

    <VcScrollbar vertical :edge-threshold="50" class="top-header-organizations__list" @keydown="onListKeydown">
      <!-- Only options may live in a listbox, so the empty state and the pager sit beside it. -->
      <ul
        :id="listboxId"
        class="top-header-organizations__listbox"
        role="listbox"
        :aria-label="$t('common.labels.organizations')"
        :tabindex="isShowSearch ? undefined : 0"
        :aria-activedescendant="isShowSearch ? undefined : activeDescendantId"
      >
        <VcMenuItem
          v-for="(item, index) in displayedOrganizations"
          :key="item.id"
          size="xs"
          role="option"
          :option-id="getOptionId(index)"
          :highlighted="index === highlightedIndex"
          :highlight-ring="!isPassiveHighlight"
          :tabindex="-1"
          :aria-selected="contactOrganizationId === item.id"
          :disabled="item.isLockedForCurrentUser"
          :title="
            item.isLockedForCurrentUser ? $t('shared.layout.header.top_header.organization_locked_tooltip') : undefined
          "
          @click="selectOrganization(item.id)"
          @mousedown="onOptionMousedown"
          @mousemove="highlightPassively(index)"
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
      </ul>

      <div
        v-if="organizations.length === 0 && !loading"
        class="top-header-organizations__empty"
        data-test-id="organizations-empty-list"
      >
        {{ $t("shared.layout.header.top_header.no_results") }}
      </div>

      <VcLoadMore :loading="loading" :has-next-page="hasNextPage" @load-more="loadOrganizations" />
    </VcScrollbar>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";
import { useOrganizationSwitcher, useUser, useUserOrganizations } from "@/shared/account";
import { useComponentId, useListboxNavigation } from "@/ui-kit/composables";
import type { ListboxNavigationKeyType } from "@/ui-kit/composables";

const emit = defineEmits<{
  organizationSelected: [];
}>();

const SEARCH_DEBOUNCE_MS = 300;

const { user, organization } = useUser();
const { searchPhrase, organizations, loading, hasNextPage, loadOrganizations, search, reset, isShowSearch } =
  useUserOrganizations();
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

// useUserOrganizations fetches only once per session, so a lock applied while this menu was
// closed would otherwise leave a stale, clickable row. Refresh on every mount to catch that.
onMounted(() => {
  void search();
});

const displayedOrganizations = computed(() => {
  const withoutCurrent = organizations.value.filter((item) => item.id !== organization.value?.id);

  // Not gated on `loading`: that un-hoists the current organization on every page request.
  if (organization.value && organizations.value.length > 0) {
    return [organization.value, ...withoutCurrent];
  }

  return withoutCurrent;
});

const {
  highlightedIndex,
  isPassiveHighlight,
  activeDescendantId,
  getOptionId,
  navigate,
  highlightPassively,
  reset: resetHighlight,
} = useListboxNavigation({
  componentId,
  items: displayedOrganizations,
  getKey: (item) => item.id,
});

async function selectOrganization(organizationId: string): Promise<void> {
  if (!organizationId) {
    return;
  }

  // The current organization is already active — selecting it must not trigger a redundant switch.
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

async function onSearch(): Promise<void> {
  await search();
}

const NAVIGATION_KEYS: Record<string, ListboxNavigationKeyType> = {
  ArrowDown: "down",
  ArrowUp: "up",
  Home: "home",
  End: "end",
};

// Without a search field the list is the tab stop and takes the keys; with one, the field does.
function onListKeydown(event: KeyboardEvent): void {
  if (isShowSearch.value) {
    return;
  }

  const direction = NAVIGATION_KEYS[event.key];

  if (direction) {
    event.preventDefault();
    navigate(direction);
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const highlighted = displayedOrganizations.value[highlightedIndex.value];

  if (highlighted) {
    event.preventDefault();
    void selectOrganization(highlighted.id);
  }
}

async function onEnter(): Promise<void> {
  const highlighted = displayedOrganizations.value[highlightedIndex.value];

  if (highlighted) {
    await selectOrganization(highlighted.id);
    return;
  }

  await onSearch();
}

const debouncedSearch = useDebounceFn(search, SEARCH_DEBOUNCE_MS);

// With a search field the keys belong to it, so a click must not move focus onto the option.
function onOptionMousedown(event: MouseEvent): void {
  if (isShowSearch.value) {
    event.preventDefault();
  }
}

// The results only change after the debounced search lands; until then Enter must search, not pick.
async function onSearchInput(): Promise<void> {
  resetHighlight();

  if (!searchPhrase.value.trim()) {
    await search();
  } else {
    void debouncedSearch();
  }
}

async function onSearchClear(): Promise<void> {
  resetHighlight();
  reset();
  await search();
}
</script>

<style lang="scss">
@use "@/ui-kit/styles/focus-ring" as *;

.top-header-organizations {
  @apply rounded-b-md border-t bg-neutral-50;

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

  &__list {
    @apply my-1 max-h-60 w-full select-none;
  }

  // The scroll region clips an outset ring.
  &__listbox:focus-visible {
    @include focus-ring($inset: true);
  }

  &__radio {
    @apply flex px-3 py-1 text-sm;
  }

  &__empty {
    @apply px-3 py-2 text-neutral-600 text-center;
  }
}
</style>
