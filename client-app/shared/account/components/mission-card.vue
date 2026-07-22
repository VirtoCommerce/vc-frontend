<template>
  <div class="mission-card">
    <div class="mission-card__banner">
      <VcImage class="mission-card__image" :src="view.bannerUrl" alt="" lazy />

      <div class="mission-card__overlay"></div>

      <VcChip class="mission-card__points" color="primary" variant="solid-light" size="sm" icon="star" rounded>
        {{ $n(view.rewardPoints, "decimal") }} {{ $t("pages.account.missions.card.points") }}
      </VcChip>

      <VcChip v-if="view.isCompleted" class="mission-card__completed" color="success" size="sm" icon="check" rounded>
        {{ $t("pages.account.missions.card.completed") }}
      </VcChip>

      <VcTypography class="mission-card__type" tag="span">{{ view.typeLabel }}</VcTypography>
    </div>

    <div class="mission-card__body">
      <div class="mission-card__meta">
        <span class="mission-card__dot" :class="`mission-card__dot--${view.dateSeverity}`"></span>

        <span v-if="view.dateLabel" class="mission-card__days">{{ view.dateLabel }}</span>
      </div>

      <div class="mission-card__progress">
        <div class="mission-card__track">
          <div
            class="mission-card__bar"
            :class="{ 'mission-card__bar--completed': view.isCompleted }"
            :style="{ width: `${view.percent}%` }"
          />
        </div>

        <span class="mission-card__percent">{{ view.percent }}%</span>
      </div>

      <VcTypography text-transform="none" class="mission-card__title" tag="h3" variant="h5">
        {{ view.title }}
      </VcTypography>

      <div class="mission-card__footer">
        <span class="mission-card__note">{{ view.progressLabel }}</span>

        <VcButton
          class="mission-card__action"
          icon="arrow-right"
          variant="outline"
          color="primary"
          :aria-label="$t('pages.account.missions.card.open_mission')"
          @click="openMission"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MISSION_TYPE, useMissionCard } from "@/modules/loyalty/composables";
import { useModal } from "@/shared/modal";
import OrderMissionModal from "./order-mission-modal.vue";
import SkuMissionModal from "./sku-mission-modal.vue";
import type { MissionDataType, MissionType } from "@/modules/loyalty/composables";
import type { Component } from "vue";

const props = defineProps<{
  mission: MissionDataType;
}>();

const { view } = useMissionCard(() => props.mission);
const { openModal } = useModal();

const MODALS_BY_TYPE: Record<MissionType, Component> = {
  [MISSION_TYPE.PerSkuAll]: SkuMissionModal,
  [MISSION_TYPE.PerSkuAny]: SkuMissionModal,
  [MISSION_TYPE.OrderValue]: OrderMissionModal,
  [MISSION_TYPE.OrderCount]: OrderMissionModal,
};

function openMission(): void {
  const missionType = (props.mission.missionType as MissionType | undefined) ?? MISSION_TYPE.PerSkuAll;

  openModal({ component: MODALS_BY_TYPE[missionType], props: { mission: props.mission } });
}
</script>

<style lang="scss">
.mission-card {
  @apply flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-additional-50 shadow-sm;

  &__banner {
    @apply relative h-36 shrink-0 bg-secondary-800;
  }

  &__image {
    @apply size-full object-cover;
  }

  &__overlay {
    @apply absolute inset-0;

    background: linear-gradient(
      180deg,
      rgb(from theme("colors.secondary.900") r g b / 0.05),
      rgb(from theme("colors.secondary.900") r g b / 0.55)
    );
  }

  &__points {
    @apply absolute left-3 top-3;
  }

  &__completed {
    @apply absolute right-3 top-3;
  }

  &__type {
    @apply absolute bottom-2.5 left-3 text-xs font-black uppercase tracking-wider text-additional-50;
  }

  &__body {
    @apply flex flex-1 flex-col p-4;
  }

  &__meta {
    @apply mb-3 flex items-center gap-2;
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

  &__days {
    @apply text-sm font-bold text-neutral-600;
  }

  &__progress {
    @apply mb-3.5 flex items-center gap-2.5;
  }

  &__track {
    @apply h-2 flex-1 overflow-hidden rounded-full bg-neutral-200;
  }

  &__bar {
    @apply h-full rounded-full bg-primary-500;

    &--completed {
      @apply bg-success-500;
    }
  }

  &__percent {
    @apply min-w-10 text-right text-sm font-black text-neutral-700;
  }

  &__title {
    @apply mb-4;
  }

  &__footer {
    @apply mt-auto flex items-center justify-between border-t border-neutral-200 pt-3.5;
  }

  &__note {
    @apply text-sm font-bold text-neutral-500;
  }

  &__action {
    @apply rounded-full;
  }
}
</style>
