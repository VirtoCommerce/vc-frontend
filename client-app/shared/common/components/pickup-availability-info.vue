<template>
  <div
    v-if="availabilityNote"
    :class="[
      'pickup-availability-info__note',
      {
        'pickup-availability-info__note--today': availabilityType === ProductPickupAvailabilityType.Today,
        'pickup-availability-info__note--transfer': availabilityType === ProductPickupAvailabilityType.Transfer,
        'pickup-availability-info__note--global': availabilityType === ProductPickupAvailabilityType.GlobalTransfer,
      },
    ]"
  >
    <VcIcon v-if="icon" name="truck" :size="iconSize" />
    {{ availabilityNote }}
  </div>
</template>

<script setup lang="ts">
import { ProductPickupAvailabilityType } from "@/core/api/graphql/types";

interface IProps {
  availabilityType?: string;
  availabilityNote?: string;

  icon?: boolean;
  iconSize?: VcIconSizeType;
}

defineProps<IProps>();
</script>

<style lang="scss">
.pickup-availability-info {
  &__note {
    @apply font-bold text-sm;

    &--today {
      @apply text-success;
    }

    &--transfer {
      @apply text-accent;
    }

    &--global {
      @apply text-accent;
    }
  }
}
</style>
