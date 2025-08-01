<template>
  <div class="ship-to-selector">
    <VcPopover
      v-if="allAddresses.length > 0"
      class="ship-to-selector__popover"
      arrow-enabled
      max-height="none"
      :offset-options="4"
    >
      <template #default="{ opened, triggerProps }">
        <button
          class="ship-to-selector__trigger"
          type="button"
          data-test-id="ship-to-selector-button"
          :disabled="loading"
          v-bind="triggerProps"
        >
          <VcIcon name="location-marker" size="xs" />

          <VcLoaderOverlay v-if="loading" no-bg />

          <span class="ship-to-selector__label">{{ $t("shared.layout.header.ship_to_selector.title") }}</span>

          <AddressLine v-if="selectedAddress" :address="selectedAddress" class="ship-to-selector__selected" />

          <span v-else class="ship-to-selector__placeholder">
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
                    @click="
                      openAddOrUpdateAddressModal();
                      close();
                    "
                  >
                    {{ $t("shared.layout.header.ship_to_selector.add_new") }}
                  </VcButton>
                </div>

                <div v-if="allAddresses.length > MAX_ADDRESSES_NUMBER" class="ship-to-selector__search">
                  <VcInput
                    v-model="filter"
                    size="sm"
                    clearable
                    :placeholder="$t('shared.layout.header.ship_to_selector.search')"
                  />
                </div>
              </div>
            </template>
          </VcDialogHeader>

          <VcDialogContent>
            <template #container>
              <div v-if="loading" class="ship-to-selector__loading">
                <VcLoader />
              </div>

              <div v-else class="ship-to-selector__items">
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
                >
                  <VcIcon
                    name="whishlist"
                    :size="16"
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

          <VcDialogFooter v-if="hasAddresses && !filter && allAddresses.length > MAX_ADDRESSES_NUMBER">
            <template #container>
              <div class="ship-to-selector__foot">
                <VcButtonSeeMoreLess :model-value="isSeeMore" size="xs" @click="isSeeMore = !isSeeMore" />
              </div>
            </template>
          </VcDialogFooter>
        </VcDialog>
      </template>
    </VcPopover>

    <button v-else type="button" class="ship-to-selector__trigger" @click="openAddOrUpdateAddressModal()">
      <VcIcon name="location-marker" size="xs" />

      <span class="ship-to-selector__label">{{ $t("shared.layout.header.ship_to_selector.title") }}</span>

      <span class="ship-to-selector__placeholder">
        {{ $t("shared.layout.header.ship_to_selector.add_new_address") }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { XApiPermissions } from "@/core/enums";
import { useUser } from "@/shared/account";
import { AddressLine } from "@/shared/common";
import { MAX_ADDRESSES_NUMBER, useShipToLocation } from "../composables";

interface IProps {
  title?: string;
}

defineProps<IProps>();

const filter = ref<string | undefined>("");
const isSeeMore = ref(false);

const {
  accountAddresses: allAddresses,
  loading,
  selectedAddress,
  organizationsAddresses,
  getFilteredAddresses,
  getLimitedAddresses,
  fetchAddresses,
  selectAddress,
  openAddOrUpdateAddressModal,
} = useShipToLocation();

const { checkPermissions, isCorporateMember } = useUser();

const addresses = computed(() => {
  if (!isSeeMore.value && !filter.value) {
    return getLimitedAddresses();
  }

  return getFilteredAddresses(filter.value);
});

const hasAddresses = computed(() => addresses.value.length > 0);
const canAddNewAddress = computed(
  () =>
    !isCorporateMember.value ||
    checkPermissions(XApiPermissions.CanEditOrganization) ||
    (!checkPermissions(XApiPermissions.CanEditOrganization) && organizationsAddresses.value.length === 0),
);

onMounted(() => {
  void fetchAddresses();
});
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
