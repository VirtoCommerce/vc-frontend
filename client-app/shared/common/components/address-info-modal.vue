<template>
  <VcModal
    class="address-info-modal"
    :title="$t(`${TRANSLATION_KEYS_ORIGIN}.pick_point_info`)"
    max-width="35rem"
    icon="check"
    variant="success"
  >
    <VcTable hide-default-footer hide-default-header :columns="TABLE_COLUMNS" :items="tableItems">
      <template #desktop-body>
        <tr v-if="eta" class="address-info-modal__table-row">
          <td>
            <span class="address-info-modal__label">{{ $t(`${TRANSLATION_KEYS_ORIGIN}.eta`) }}:</span>
          </td>
          <td>{{ eta }}</td>
        </tr>

        <tr
          v-if="pickupLocation.contactEmail || pickupLocation.contactPhone"
          class="address-info-modal__table-row mb-4"
        >
          <td>
            <span class="address-info-modal__label">{{ $t(`${TRANSLATION_KEYS_ORIGIN}.questions`) }}</span>
          </td>

          <td>
            <i18n-t :keypath="contactKey">
              <template #email>
                <a class="address-info-modal__link" :href="`mailto:${pickupLocation.contactEmail}`">
                  {{ pickupLocation.contactEmail }}
                </a>
              </template>

              <template #phone>
                <a class="address-info-modal__link" :href="`tel:${pickupLocation.contactPhone}`">
                  {{ pickupLocation.contactPhone }}
                </a>
              </template>
            </i18n-t>
          </td>
        </tr>

        <tr v-if="pickupLocation.name" class="address-info-modal__table-row">
          <td class="min-w-20">
            <span class="address-info-modal__label">{{ $t(`${TRANSLATION_KEYS_ORIGIN}.name`) }}:</span>
          </td>
          <td>{{ pickupLocation.name }}</td>
        </tr>

        <tr v-if="address" class="address-info-modal__table-row">
          <td class="min-w-20">
            <span class="address-info-modal__label">{{ $t(`${TRANSLATION_KEYS_ORIGIN}.address`) }}:</span>
          </td>

          <td><AddressLine :address="address"></AddressLine></td>
        </tr>

        <tr v-if="pickupLocation.workingHours" class="address-info-modal__table-row">
          <td class="min-w-20">
            <span class="address-info-modal__label">{{ $t(`${TRANSLATION_KEYS_ORIGIN}.workingHours`) }}:</span>
          </td>
          <td><VcMarkdownRender :src="pickupLocation.workingHours" /></td>
        </tr>

        <tr v-if="pickupLocation.description" class="address-info-modal__table-row">
          <td class="min-w-20">
            <span class="address-info-modal__label">{{ $t(`${TRANSLATION_KEYS_ORIGIN}.instructions`) }}:</span>
          </td>
          <td>{{ pickupLocation.description }}</td>
        </tr>
      </template>
    </VcTable>
    <template #actions="{ close }">
      <GetDirectionsAction v-if="link" size="md" :link="link" />

      <VcButton class="address-info-modal__action-ok" @click="close">
        {{ $t("common.buttons.ok") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AddressLine } from "@/shared/common";
import GetDirectionsAction from "./get-directions-action.vue";
import type { PickupLocationType } from "@/core/api/graphql/types.ts";

const props = defineProps<IProps>();

type PickupType = Pick<
  PickupLocationType,
  "address" | "contactPhone" | "contactEmail" | "workingHours" | "name" | "description"
>;
interface IProps {
  //  Estimated Time of Arrival
  eta?: string;
  link?: string;
  pickupLocation: PickupType;
}

const TRANSLATION_KEYS_ORIGIN = "pages.account.order_details.bopis";

const TABLE_COLUMNS = [{ id: "label" }];

// Minimal implementation: no table head and no separate mobile layout.
// Extend as needed.
const tableItems = computed(() => {
  return [{ label: "eta" }, { label: "questions" }, { label: "address" }];
});

const address = computed(() => {
  return props.pickupLocation.address;
});

const contactKey = computed(() => {
  let key = "";
  const email = props.pickupLocation.contactEmail;
  const phone = props.pickupLocation.contactPhone;

  if (email && phone) {
    key = `${TRANSLATION_KEYS_ORIGIN}.emailAndPhone`;
  } else if (email) {
    key = `${TRANSLATION_KEYS_ORIGIN}.emailOnly`;
  } else if (phone) {
    key = `${TRANSLATION_KEYS_ORIGIN}.phoneOnly`;
  }

  return key;
});
</script>

<style lang="scss">
.address-info-modal {
  @apply text-base;

  &__table-row {
    @apply flex items-start gap-1;
  }

  &__link {
    @apply py-1 text-[--header-top-link-color] hover:text-[--header-top-link-hover-color];

    &:hover {
      @apply text-[--link-hover-color];
    }
  }

  &__label {
    @apply font-bold;
  }

  &__action-ok {
    @apply ml-auto;
  }
}
</style>
