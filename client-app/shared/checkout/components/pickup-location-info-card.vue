<template>
  <VcDialog v-if="location" dividers class="pickup-location-info-card">
    <VcDialogHeader @close="$emit('close')">
      {{ $t("shared.checkout.select_bopis_modal.pick_point_info_title") }}
    </VcDialogHeader>

    <VcDialogContent>
      <div class="pickup-location-info-card__content">
        <div class="pickup-location-info-card__name">
          {{ location.name }}
        </div>

        <PickupAvailabilityInfo
          class="pickup-location-info-card__availability"
          :availability-type="location.availabilityType"
          :availability-note="location.availabilityNote"
        />

        <dl class="pickup-location-info-card__info">
          <dt>{{ $t("shared.checkout.select_bopis_modal.location_label") }}</dt>

          <dd>{{ getAddressName(location) }}</dd>

          <template v-if="location.workingHours">
            <dt>{{ $t("shared.checkout.select_bopis_modal.working_hours_label") }}</dt>

            <dd>
              <VcMarkdownRender class="pickup-location-info-card__working-hours" :src="location.workingHours" />
            </dd>
          </template>

          <template v-if="location.contactPhone">
            <dt>{{ $t("shared.checkout.select_bopis_modal.contact_phone_label") }}</dt>

            <dd>
              <a :href="`tel:${location.contactPhone}`">{{ location.contactPhone }}</a>
            </dd>
          </template>

          <template v-if="location.contactEmail">
            <dt>{{ $t("shared.checkout.select_bopis_modal.contact_email_label") }}</dt>

            <dd>
              <a :href="`mailto:${location.contactEmail}`">{{ location.contactEmail }}</a>
            </dd>
          </template>

          <template v-if="location.description">
            <dt>{{ $t("shared.checkout.select_bopis_modal.description_label") }}</dt>

            <dd>{{ location.description }}</dd>
          </template>
        </dl>
      </div>
    </VcDialogContent>

    <VcDialogFooter>
      <VcButton variant="outline" color="secondary" @click="$emit('close')">
        {{ $t("common.buttons.cancel") }}
      </VcButton>

      <VcButton @click="onSelect">
        {{ $t("shared.checkout.select_bopis_modal.pick_up_here") }}
      </VcButton>
    </VcDialogFooter>
  </VcDialog>
</template>

<script setup lang="ts">
import { getAddressName } from "@/core/utilities/address";
import type { PickupLocationType } from "@/shared/checkout/composables";
import PickupAvailabilityInfo from "@/shared/common/components/pickup-availability-info.vue";

interface IProps {
  location?: PickupLocationType;
}

interface IEmits {
  (event: "close"): void;
  (event: "select", locationId: string): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

function onSelect() {
  if (props.location?.id) {
    emit("select", props.location.id);
  }
  emit("close");
}
</script>

<style lang="scss">
.pickup-location-info-card {
  @apply flex flex-col h-full max-h-full;

  &__content {
    @apply flex flex-col gap-2;
  }

  &__name {
    @apply text-lg font-bold;
  }

  &__info {
    dt {
      @apply mt-1.5 text-xs font-bold;
    }

    dd {
      @apply text-xs text-neutral-600;
    }
  }

  &__working-hours {
    @apply text-xs;
  }
}
</style>
