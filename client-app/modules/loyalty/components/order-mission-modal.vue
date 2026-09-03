<template>
  <VcModal
    ref="modalRef"
    class="order-mission-modal"
    :title="view.title"
    is-mobile-fullscreen
    dividers
    test-id="order-mission-modal"
  >
    <div class="order-mission-modal__content">
      <!-- Meta -->
      <div class="order-mission-modal__meta">
        <VcChip color="primary" variant="soft" size="sm" rounded>
          <VcIcon name="star" variant="solid" />
          {{ $n(view.rewardPoints, "decimal") }} {{ $t("pages.account.missions.card.points") }}
        </VcChip>

        <span class="order-mission-modal__days">
          <VcBadge :color="view.dateSeverity" />

          {{ view.dateLabel }}
        </span>
      </div>

      <p v-if="mission.description" class="order-mission-modal__description">
        {{ mission.description }}
      </p>

      <!-- Target -->
      <div class="order-mission-modal__target">
        <span class="order-mission-modal__target-label">
          {{ $t("pages.account.missions.order_modal.mission_target") }}
        </span>

        <div class="order-mission-modal__target-row">
          <span class="order-mission-modal__requirement">{{ requirementLabel }}</span>

          <span class="order-mission-modal__current">{{ view.progressLabel }}</span>
        </div>

        <div class="order-mission-modal__progress">
          <div class="order-mission-modal__track">
            <div class="order-mission-modal__bar" :style="{ width: `${view.percent}%` }"></div>
          </div>

          <span class="order-mission-modal__percent">{{ view.percent }}%</span>
        </div>
      </div>
    </div>

    <template #actions="{ close }">
      <VcButton color="secondary" variant="outline" @click="close">
        {{ $t("pages.account.missions.order_modal.close") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useCloseModalOnRouteChange } from "@/shared/modal";
import { MISSION_TYPE, useMissionCard } from "../composables";
import type { MissionDataType, MissionType } from "../composables";

interface IProps {
  mission: MissionDataType;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { view } = useMissionCard(() => props.mission);

const modalRef = useTemplateRef<{ close: () => void }>("modalRef");
useCloseModalOnRouteChange(() => modalRef.value?.close());

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
.order-mission-modal {
  &__content {
    @apply flex flex-col gap-5 pb-4;
  }

  &__meta {
    @apply flex flex-wrap items-center gap-3;
  }

  &__days {
    @apply flex items-center gap-2 text-sm font-bold text-neutral-600;
  }

  &__description {
    @apply text-sm text-neutral-600;
  }

  &__target {
    @apply flex flex-col gap-3 rounded-[--vc-radius] bg-neutral-50 p-4 border-neutral-200 border;
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
    @apply min-w-10 text-end text-sm font-black text-neutral-700;
  }
}
</style>
