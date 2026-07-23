<template>
  <VcModal :title="view.title" is-mobile-fullscreen dividers test-id="mission-details-modal">
    <div class="order-mission-details">
      <!-- Meta -->
      <div class="order-mission-details__meta">
        <VcChip color="primary" variant="solid-light" size="sm" icon="star" rounded>
          {{ $n(view.rewardPoints, "decimal") }} {{ $t("pages.account.missions.card.points") }}
        </VcChip>

        <span class="order-mission-details__days">
          <span class="order-mission-details__dot" :class="`order-mission-details__dot--${view.dateSeverity}`"></span>
          {{ view.dateLabel }}
        </span>
      </div>

      <p v-if="mission.description" class="order-mission-details__description">
        {{ mission.description }}
      </p>

      <!-- Target -->
      <div class="order-mission-details__target">
        <span class="order-mission-details__target-label">
          {{ $t("pages.account.missions.order_modal.mission_target") }}
        </span>

        <div class="order-mission-details__target-row">
          <span class="order-mission-details__requirement">{{ requirementLabel }}</span>

          <span class="order-mission-details__current">{{ view.progressLabel }}</span>
        </div>

        <div class="order-mission-details__progress">
          <div class="order-mission-details__track">
            <div class="order-mission-details__bar" :style="{ width: `${view.percent}%` }"></div>
          </div>

          <span class="order-mission-details__percent">{{ view.percent }}%</span>
        </div>
      </div>
    </div>

    <template #actions="{ close }">
      <VcButton color="secondary" variant="outline" @click="close">
        {{ $t("pages.account.missions.order_modal.close") }}
      </VcButton>

      <VcButton v-if="false" :to="{ name: 'Catalog' }" append-icon="chevron-right">
        {{ $t("pages.account.missions.order_modal.redeem_products") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { MISSION_TYPE, useMissionCard } from "@/modules/loyalty/composables";
import type { MissionDataType, MissionType } from "@/modules/loyalty/composables";

const props = defineProps<{
  mission: MissionDataType;
}>();

const { t } = useI18n();
const { view } = useMissionCard(() => props.mission);

const requirementLabel = computed(() => {
  const missionType = (props.mission.missionType as MissionType | undefined) ?? MISSION_TYPE.OrderValue;

  return missionType === MISSION_TYPE.OrderCount
    ? t("pages.account.missions.order_modal.count_requirement", { target: props.mission.targetValue ?? 0 })
    : t("pages.account.missions.order_modal.value_requirement", {
        target: props.mission.targetMoneyValue?.formattedAmount ?? "",
      });
});
</script>

<style lang="scss">
.order-mission-details {
  @apply flex flex-col gap-5 pb-4;

  &__meta {
    @apply flex flex-wrap items-center gap-3;
  }

  &__days {
    @apply flex items-center gap-2 text-sm font-bold text-neutral-600;
  }

  &__dot {
    @apply size-2.5 shrink-0 rounded-full;

    &--safe {
      @apply bg-success-500;
    }

    &--warning {
      @apply bg-warning-500;
    }

    &--danger {
      @apply bg-danger-500;
    }
  }

  &__description {
    @apply text-sm text-neutral-600;
  }

  &__target {
    @apply flex flex-col gap-3 rounded-lg bg-neutral-50 p-4 border-neutral-200 border;
  }

  &__target-label {
    @apply text-xs font-black uppercase tracking-wide text-neutral-500;
  }

  &__target-row {
    @apply flex items-center justify-between gap-3;
  }

  &__requirement {
    @apply text-sm font-bold text-neutral-800;
  }

  &__current {
    @apply shrink-0 text-sm font-black text-neutral-600;
  }

  &__progress {
    @apply flex items-center gap-2.5;
  }

  &__track {
    @apply h-2 flex-1 overflow-hidden rounded-full bg-neutral-200;
  }

  &__bar {
    @apply h-full rounded-full bg-primary-500 transition-all;
  }

  &__percent {
    @apply min-w-10 text-right text-sm font-black text-neutral-700;
  }
}
</style>
