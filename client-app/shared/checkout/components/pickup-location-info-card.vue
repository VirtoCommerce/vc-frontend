<template>
  <VcDialog v-if="location" dividers size="xs" class="pickup-location-info-card">
    <VcDialogHeader @close="emit('close')">
      {{ location.name }}
    </VcDialogHeader>

    <VcDialogContent>
      <PickupAvailabilityInfo
        class="pickup-location-info-card__availability"
        :availability-type="location.availabilityType"
        :availability-note="location.availabilityNote"
      />

      <dl class="pickup-location-info-card__content">
        <dt>
          {{ $t("shared.checkout.select_bopis_modal.location_label") }}
        </dt>

        <dd>{{ getAddressName(location) }}</dd>

        <dt v-if="location.contactPhone">
          {{ $t("shared.checkout.select_bopis_modal.contact_phone_label") }}
        </dt>

        <dd v-if="location.contactPhone">
          <a :href="`tel:${location.contactPhone}`">{{ location.contactPhone }}</a>
        </dd>

        <dt v-if="location.contactEmail">
          {{ $t("shared.checkout.select_bopis_modal.contact_email_label") }}
        </dt>

        <dd v-if="location.contactEmail">
          <a :href="`mailto:${location.contactEmail}`">{{ location.contactEmail }}</a>
        </dd>

        <dt v-if="location.workingHours">
          {{ $t("shared.checkout.select_bopis_modal.working_hours_label") }}
        </dt>

        <dd v-if="location.workingHours">
          <VcMarkdownRender class="pickup-location-info-card__working-hours" :src="location.workingHours" />
        </dd>

        <dt v-if="location.description">
          {{ $t("shared.checkout.select_bopis_modal.description_label") }}
        </dt>

        <dd v-if="location.description">{{ location.description }}</dd>
      </dl>
    </VcDialogContent>

    <VcDialogFooter>
      <VcButton variant="no-background" color="secondary" size="xs" @click="emit('close')">
        {{ $t("common.buttons.cancel") }}
      </VcButton>

      <VcButton size="xs" variant="outline" @click="emit('select')">
        {{ $t("common.buttons.select") }}
      </VcButton>
    </VcDialogFooter>
  </VcDialog>
</template>

<script setup lang="ts">
import { getAddressName } from "@/core/utilities/address";
import type { GetCartPickupLocationsQuery } from "@/core/api/graphql/types";
import PickupAvailabilityInfo from "@/shared/common/components/pickup-availability-info.vue";

type PickupLocationType = NonNullable<NonNullable<GetCartPickupLocationsQuery["cartPickupLocations"]>["items"]>[number];

interface IProps {
  location?: PickupLocationType;
}

interface IEmits {
  (event: "close"): void;
  (event: "select"): void;
}

const emit = defineEmits<IEmits>();
defineProps<IProps>();
</script>

<style lang="scss">
.pickup-location-info-card {
  &__availability {
    @apply mb-2;
  }

  &__content {
    dt {
      @apply mt-1.5 text-xxs font-bold;

      word-break: break-word;
    }

    dd {
      @apply text-xxs font-normal text-neutral-600;

      word-break: break-word;
    }
  }

  &__working-hours {
    @apply text-xxs;
  }
}
</style>
