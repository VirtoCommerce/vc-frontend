<template>
  <div class="ship-to-selector">
    <VcPopover
      v-if="hasAnyAddresses"
      class="ship-to-selector__popover"
      arrow-enabled
      max-height="none"
      :offset-options="4"
      data-test-id="ship-to-selector"
    >
      <template #default="{ opened, triggerProps }">
        <button class="ship-to-selector__trigger" type="button" :disabled="loading" v-bind="triggerProps">
          <VcIcon name="location-marker" size="xs" />

          <VcLoaderOverlay v-if="loading" no-bg />

          <span class="ship-to-selector__label">{{ $t("shared.layout.header.ship_to_selector.title") }}</span>

          <AddressLine
            v-if="selectedAddress"
            :address="selectedAddress"
            class="ship-to-selector__selected"
            data-test-id="selected-address-label"
          />

          <span v-else class="ship-to-selector__placeholder" data-test-id="select-address-label">
            {{ $t("shared.layout.header.ship_to_selector.select_address") }}
          </span>

          <VcIcon size="xxs" :name="opened ? 'chevron-up' : 'chevron-down'" />
        </button>
      </template>

      <template #content="{ close }">
        <VcDialog dividers class="ship-to-selector__dialog" tabindex="-1">
          <VcDialogHeader :closable="false">
            <template #main>
              <div class="ship-to-selector__header">
                <div class="ship-to-selector__head">
                  <div class="ship-to-selector__title">
                    {{ $t("shared.layout.header.ship_to_selector.select_address") }}
                  </div>

                  <VcButton
                    v-if="canAddNewAddress"
                    size="xs"
                    variant="outline"
                    color="secondary"
                    prepend-icon="plus"
                    data-test-id="ship-to-add-new-address"
                    @click="
                      openAddOrUpdateAddressModal();
                      close();
                    "
                  >
                    {{ $t("shared.layout.header.ship_to_selector.add_new") }}
                  </VcButton>
                </div>

                <div v-if="showSearch" class="ship-to-selector__search">
                  <VcInput
                    v-model="filter"
                    size="sm"
                    clearable
                    data-test-id="ship-to-search-field"
                    :placeholder="$t('shared.layout.header.ship_to_selector.search')"
                  />
                </div>
              </div>
            </template>
          </VcDialogHeader>

          <VcDialogContent>
            <template #container>
              <div v-if="isListLoading" class="ship-to-selector__loading">
                <VcLoader />
              </div>

              <div
                v-else-if="!hasAddresses && filter"
                class="ship-to-selector__empty"
                data-test-id="ship-to-no-results"
              >
                {{ $t("shared.layout.header.ship_to_selector.no_results") }}
              </div>

              <div v-else class="ship-to-selector__items" data-test-id="shipping-addresses-list">
                <button
                  v-for="address in addresses"
                  :key="address.id"
                  type="button"
                  :class="[
                    'ship-to-selector__item',
                    {
                      'ship-to-selector__item--active': selectedAddress && selectedAddress.id === address.id,
                    },
                  ]"
                  @click="
                    selectAddress(address);
                    close();
                  "
                  :data-country="address.countryName"
                  :data-region="address.regionName"
                  :data-city="address.city"
                  :data-line-1="address.line1"
                  :data-postal-code="address.postalCode"
                >
                  <VcIcon
                    name="whishlist"
                    :size="16"
                    :data-test-id="`ship-to-favorite-icon-${address.id}`"
                    :class="[
                      'ship-to-selector__favorite',
                      {
                        'ship-to-selector__favorite--invisible': !address.isFavorite,
                      },
                    ]"
                  />

                  <span class="ship-to-selector__address">
                    <AddressLine :address="address" />
                  </span>
                </button>
              </div>
            </template>
          </VcDialogContent>

          <VcDialogFooter
            v-if="isPaginated ? pages > 1 : hasAddresses && !filter && allAddresses.length > MAX_ADDRESSES_NUMBER"
          >
            <template #container>
              <div class="ship-to-selector__foot">
                <VcPagination
                  v-if="isPaginated"
                  v-model:page="page"
                  :pages="pages"
                  compact
                  data-test-id="ship-to-pagination"
                />

                <VcButtonSeeMoreLess
                  v-else
                  :model-value="isSeeMore"
                  size="xs"
                  data-test-id="ship-to-more-button"
                  @click="isSeeMore = !isSeeMore"
                />
              </div>
            </template>
          </VcDialogFooter>
        </VcDialog>
      </template>
    </VcPopover>

    <button
      v-else
      type="button"
      class="ship-to-selector__trigger"
      data-test-id="add-shipping-address-button"
      @click="openAddOrUpdateAddressModal()"
    >
      <VcIcon name="location-marker" size="xs" />

      <span class="ship-to-selector__label">{{ $t("shared.layout.header.ship_to_selector.title") }}</span>

      <span class="ship-to-selector__placeholder">
        {{ $t("shared.layout.header.ship_to_selector.add_new_address") }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { XApiPermissions } from "@/core/enums";
import { useUser } from "@/shared/account";
import { AddressLine } from "@/shared/common";
import { MAX_ADDRESSES_NUMBER, useShipToLocation } from "../composables";

interface IProps {
  title?: string;
}

defineProps<IProps>();

const SEARCH_DEBOUNCE_IN_MS = 300;

const filter = ref<string | undefined>("");
const isSeeMore = ref(false);

const {
  accountAddresses: allAddresses,
  loading,
  selectedAddress,
  organizationsAddresses,
  isPaginated,
  page,
  pages,
  totalCount,
  keyword,
  selectAddress,
  getLocalFilteredAddresses,
  openAddOrUpdateAddressModal,
} = useShipToLocation();

const { checkPermissions, isCorporateMember } = useUser();

// When server-paginated (PERSONAL / CORPORATE with org access), allAddresses is already the
// current page/search result - render it directly. Otherwise (ANONYMOUS / CORPORATE_LIMITED
// fallback) it's the full small local-storage list, filtered/sliced client-side.
const addresses = computed(() => {
  if (isPaginated.value) {
    return allAddresses.value;
  }

  if (!isSeeMore.value && !filter.value) {
    return getLocalFilteredAddresses().slice(0, MAX_ADDRESSES_NUMBER);
  }

  return getLocalFilteredAddresses(filter.value);
});

const hasAddresses = computed(() => addresses.value.length > 0);

// Based on the true total, not the current (possibly filtered) view, so an empty search result
// doesn't hide the whole dropdown behind the "add new address" button.
const hasAnyAddresses = computed(() =>
  isPaginated.value ? totalCount.value > 0 || !!filter.value : allAddresses.value.length > 0,
);

const showSearch = computed(
  () =>
    !!filter.value ||
    (isPaginated.value ? totalCount.value > MAX_ADDRESSES_NUMBER : allAddresses.value.length > MAX_ADDRESSES_NUMBER),
);

const canAddNewAddress = computed(
  () =>
    !isCorporateMember.value ||
    checkPermissions(XApiPermissions.CanEditOrganization) ||
    (!checkPermissions(XApiPermissions.CanEditOrganization) && organizationsAddresses.value.length === 0),
);

const applyKeyword = useDebounceFn((value: string | undefined) => {
  keyword.value = value ?? "";
}, SEARCH_DEBOUNCE_IN_MS);

watch(filter, applyKeyword);

// filter (the search box) updates instantly; keyword (the server-side filter actually applied to
// `allAddresses`) only catches up after the debounce above fires and its query resolves. In
// between - e.g. if isPaginated flips true mid-typing because the org/personal list just loaded -
// `allAddresses` can reflect a different keyword than what's currently typed. Treat that window as
// loading rather than rendering a list that doesn't match the search box, so a stale address can't
// be clicked by mistake.
const isSearchSyncing = computed(() => isPaginated.value && filter.value !== keyword.value);
const isListLoading = computed(() => loading.value || isSearchSyncing.value);
</script>

<style lang="scss">
.ship-to-selector {
  --vc-icon-color: theme("colors.primary.500");
  --vc-dialog-width: calc(100vw - 1rem);
  --vc-dialog-max-height: calc(100vh - 2.5rem);

  @apply grow flex min-w-0 h-full text-[--header-top-text-color];

  @media (min-width: theme("screens.sm")) {
    --vc-dialog-width: 25rem;
    --vc-dialog-max-height: calc(100vh - 3.5rem);
  }

  &__popover {
    @apply flex items-stretch max-w-full h-full;
  }

  &__trigger {
    @apply flex items-center p-1 max-w-full h-full gap-1 relative font-bold;

    @media (min-width: theme("screens.lg")) {
      @apply font-normal;
    }
  }

  &__label {
    @apply whitespace-nowrap;
  }

  &__placeholder {
    @apply font-bold text-[--header-top-link-color];

    &:hover {
      @apply text-[--header-top-link-hover-color];
    }
  }

  &__selected {
    @apply truncate font-bold text-[--header-top-link-color];

    &:hover {
      @apply text-[--header-top-link-hover-color];
    }
  }

  &__dialog {
    @apply text-neutral-900;

    @media (width < theme("screens.sm")) {
      @apply mx-2;
    }
  }

  &__loading {
    @apply flex items-center justify-center min-h-20;
  }

  &__header {
    @apply w-full divide-y;
  }

  &__head {
    @apply flex items-center gap-2 min-h-14 px-4 py-1;
  }

  &__search {
    @apply px-4 py-3;
  }

  &__title {
    @apply flex items-center gap-2 me-auto text-base font-bold;
  }

  &__empty {
    @apply flex items-center justify-center min-h-20 text-neutral-400 text-sm;
  }

  &__items {
    @apply divide-y;
  }

  &__item {
    @apply flex gap-1 items-center py-2 px-3 w-full min-h-[3.125rem] text-start;

    &--active,
    &:hover {
      @apply bg-secondary-100;
    }
  }

  &__address {
    @apply grow;
  }

  &__favorite {
    &--invisible {
      @apply invisible;
    }
  }

  &__foot {
    @apply flex justify-center px-4 py-2 w-full;
  }
}
</style>
