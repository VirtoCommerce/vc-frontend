<template>
  <div class="mission-card">
    <div class="mission-card__banner">
      <VcImage
        v-if="view.bannerUrl && !isBackdropFailed"
        class="mission-card__backdrop"
        :src="view.bannerUrl"
        alt=""
        lazy
        @error="isBackdropFailed = true"
      />

      <VcImage class="mission-card__image" :src="view.bannerUrl" alt="" lazy />

      <div v-if="view.isCompleted" class="mission-card__done" aria-hidden="true">
        <VcIcon name="circle-check" :size="56" />
      </div>

      <div class="mission-card__badges">
        <VcChip color="warning" variant="tonal" size="sm" rounded>
          <VcIcon class="vc-chip__icon mission-card__points-icon" name="star" variant="solid" />
          {{ $n(view.rewardPoints, "decimal") }} {{ $t("pages.account.missions.card.points") }}
        </VcChip>

        <VcChip color="info" variant="tonal" size="sm" rounded>
          <VcIcon class="vc-chip__icon mission-card__type-icon" :name="typeIcon" variant="solid" />
          {{ view.typeLabel }}
        </VcChip>
      </div>
    </div>

    <div class="mission-card__body">
      <span class="mission-card__note">{{ view.progressLabel }}</span>

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
        <MissionDateBadge :severity="view.dateSeverity" :label="view.dateLabel" />

        <VcButton
          icon="arrow-right"
          variant="outline"
          color="primary"
          size="sm"
          :aria-label="$t('pages.account.missions.card.open_mission')"
          @click="openMission"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useModal } from "@/shared/modal";
import { MISSION_TYPE, useMissionCard } from "../composables";
import MissionDateBadge from "./mission-date-badge.vue";
import OrderMissionModal from "./order-mission-modal.vue";
import SkuMissionModal from "./sku-mission-modal.vue";
import type { MissionDataType, MissionType } from "../composables";
import type { Component } from "vue";

interface IProps {
  mission: MissionDataType;
}

const props = defineProps<IProps>();

const { view } = useMissionCard(() => props.mission);

const isBackdropFailed = ref(false);

const TYPE_ICONS: Record<MissionType, string> = {
  [MISSION_TYPE.PerSkuAll]: "barcode",
  [MISSION_TYPE.PerSkuAny]: "barcode",
  [MISSION_TYPE.OrderValue]: "cash",
  [MISSION_TYPE.OrderCount]: "shopping-bag",
};

const typeIcon = computed(() => TYPE_ICONS[props.mission.missionType as MissionType] ?? TYPE_ICONS.PerSkuAll);
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
  @apply flex flex-col overflow-hidden rounded-[--vc-radius] border border-neutral-200 bg-additional-50 shadow-md;

  &__banner {
    @apply relative h-52 shrink-0 overflow-hidden bg-secondary-800;
  }

  &__backdrop {
    @apply absolute inset-0 size-full scale-110 object-cover opacity-60 blur-lg;
  }

  &__image {
    @apply relative size-full object-contain;
  }

  &__done {
    @apply absolute inset-0 flex items-center justify-center text-additional-50;

    background: rgb(from theme("colors.success.600") r g b / 0.55);
  }

  &__badges {
    @apply absolute left-3 top-3 flex flex-wrap gap-2;
  }

  &__body {
    @apply flex flex-1 flex-col p-4;
  }

  &__note {
    @apply mb-2 text-sm font-bold text-neutral-500;
  }

  &__progress {
    @apply mb-3.5 flex items-center gap-2.5;
  }

  &__track {
    @apply h-2 flex-1 overflow-hidden rounded-full bg-neutral-200;
  }

  &__bar {
    @apply h-full rounded-full bg-info-500;

    &--completed {
      @apply bg-success-500;
    }
  }

  &__percent {
    @apply min-w-10 text-end text-sm font-black text-neutral-700;
  }

  &__title {
    @apply mb-4;
  }

  &__footer {
    @apply mt-auto flex items-center justify-between border-t border-neutral-200 pt-3.5;
  }
}
</style>
