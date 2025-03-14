<template>
  <div class="ship-to-selector">
    <VcPopover class="ship-to-selector__popover" arrow-enabled max-height="none" close-on-blur :offset-options="12">
      <template #trigger="{ opened }">
        <button class="ship-to-selector__trigger" type="button">
          <VcIcon name="location-marker" size="xs" />

          <span class="ship-to-selector__label">{{ $t("shared.layout.header.ship_to_selector.title") }}:</span>

          <AddressLine v-if="selectedAddress" :address="selectedAddress" class="ship-to-selector__selected" />

          <span v-else class="ship-to-selector__placeholder">{{
            $t("shared.layout.header.ship_to_selector.select_address")
          }}</span>

          <VcIcon size="xxs" :name="opened ? 'chevron-up' : 'chevron-down'" />
        </button>
      </template>

      <template #content="{ close }">
        <VcDialog dividers class="ship-to-selector__dialog" tabindex="-1">
          <VcDialogHeader :closable="false">
            <template #main>
              <div class="ship-to-selector__header">
                <div class="ship-to-selector__head">
                  <div v-if="hasAddresses" class="ship-to-selector__title">
                    {{ $t("shared.layout.header.ship_to_selector.select_address") }}
                  </div>
                  <VcButton
                    class="ship-to-selector__add-new"
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

                <div v-if="hasAddresses" class="ship-to-selector__search">
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

          <VcDialogFooter v-if="filter.length === 0 && hasAddresses">
            <template #container>
              <div class="ship-to-selector__foot">
                <VcButtonSeeMoreLess
                  v-if="allAddresses.length > MAX_ADDRESSES_NUMBER"
                  :model-value="isSeeMore"
                  size="xs"
                  @click="isSeeMore = !isSeeMore"
                />
              </div>
            </template>
          </VcDialogFooter>
        </VcDialog>
      </template>
    </VcPopover>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect, ref } from "vue";
import { AddressLine } from "@/shared/common";
import { MAX_ADDRESSES_NUMBER, useBopis } from "../composables";

interface IProps {
  title?: string;
}

defineProps<IProps>();

const filter = ref("");
const isSeeMore = ref(false);

const {
  accountAddresses: allAddresses,
  loading,
  selectedAddress,
  getFilteredAddresses,
  fetchAddresses,
  selectAddress,
  openAddOrUpdateAddressModal,
} = useBopis();

const addresses = computed(() => getFilteredAddresses(isSeeMore.value, filter.value));
const hasAddresses = computed(() => addresses.value.length > 0);

watchEffect(async () => {
  await fetchAddresses();
});
</script>

<style lang="scss">
.ship-to-selector {
  --vc-icon-color: theme("colors.primary.500");
  --vc-dialog-width: calc(100vw - 1rem);
  --vc-dialog-max-height: calc(100vh - 2.5rem);

  @apply grow flex w-0 h-full;

  @media (min-width: theme("screens.sm")) {
    --vc-dialog-width: 25rem;
    --vc-dialog-max-height: calc(100vh - 3.5rem);
  }

  &__popover {
    @apply flex flex-col justify-center max-w-full h-full;
  }

  &__trigger {
    @apply inline-flex items-center max-w-full h-full gap-1;
  }

  &__label {
    @apply whitespace-nowrap;
  }

  &__placeholder {
    @apply font-bold;
  }

  &__selected {
    @apply font-bold text-[--header-top-link-color] hover:text-[--header-top-link-hover-color] truncate;
  }

  &__dialog {
    @apply text-neutral-900;

    @media (width < theme("screens.sm")) {
      @apply mx-2;
    }
  }

  &__loader {
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

  &__empty {
    @apply py-2 text-sm text-neutral;
  }

  &__add-new {
    @apply only:flex-grow;
  }
}
</style>
