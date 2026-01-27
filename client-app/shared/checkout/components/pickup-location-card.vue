<template>
  <VcDialog v-if="location" dividers class="pickup-location-card" size="xs">
    <VcDialogHeader @close="$emit('close')">
      <template #main>
        <div class="pickup-location-card__header">
          {{ $t("shared.checkout.select_bopis_modal.pick_point_info_title") }}
        </div>
      </template>
    </VcDialogHeader>

    <VcDialogContent>
      <template #container>
        <div class="pickup-location-card__content">
          <div class="pickup-location-card__name">
            {{ location.name }}
          </div>

          <PickupAvailabilityInfo
            class="pickup-location-card__availability"
            :availability-type="location.availabilityType"
            :availability-note="location.availabilityNote"
          />

          <dl class="pickup-location-card__info">
            <dt>{{ $t("shared.checkout.select_bopis_modal.location_label") }}</dt>

            <dd>{{ getAddressName(location) }}</dd>

            <template v-if="location.workingHours">
              <dt>{{ $t("shared.checkout.select_bopis_modal.working_hours_label") }}</dt>

              <dd>
                <VcMarkdownRender class="pickup-location-card__working-hours" :src="location.workingHours" />
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
      </template>
    </VcDialogContent>

    <VcDialogFooter>
      <template #container>
        <div class="pickup-location-card__actions">
          <VcButton variant="outline" color="secondary" truncate size="sm" @click="$emit('close')">
            {{ $t("common.buttons.cancel") }}
          </VcButton>

          <VcButton truncate size="sm" @click="onSelect">
            {{ $t("shared.checkout.select_bopis_modal.pick_up_here") }}
          </VcButton>
        </div>
      </template>
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
.pickup-location-card {
  @apply h-full max-h-full;

  @media (min-width: theme("screens.md")) {
    @apply h-auto max-h-none;
  }

  &__header {
    @apply grow flex items-center px-3.5 py-2 text-sm font-bold;
  }

  &__content {
    @apply flex flex-col gap-2 items-start px-3.5 py-3;
  }

  &__name {
    @apply text-sm font-bold text-neutral-950;
  }

  &__info {
    dt {
      @apply mt-2 text-xs font-bold text-neutral-900;
    }

    dd {
      @apply text-xs text-neutral-600;
    }
  }

  &__working-hours {
    @apply text-xs;
  }

  &__actions {
    @apply flex justify-between gap-3 w-full px-3.5 py-3;
  }
}
</style>
