<template>
  <VcModal :title="view.title" max-width="42rem" is-mobile-fullscreen dividers test-id="mission-details-modal">
    <div class="mission-details">
      <!-- Meta -->
      <div class="mission-details__meta">
        <VcChip color="primary" variant="solid-light" size="sm" icon="star" rounded>
          {{ $n(view.rewardPoints, "decimal") }} {{ $t("pages.account.missions.card.points") }}
        </VcChip>

        <span class="mission-details__days">
          <span class="mission-details__dot" :class="`mission-details__dot--${view.dateSeverity}`"></span>
          {{ view.dateLabel }}
        </span>
      </div>

      <p v-if="mission.description" class="mission-details__description">
        {{ mission.description }}
      </p>

      <!-- Products (SKU list; product cards are loaded separately later) -->
      <ul class="mission-details__items">
        <li v-for="row in rows" :key="row.id" class="mission-details__item">
          <VcImage class="mission-details__image" :src="row.image" :alt="row.id" lazy />

          <div class="mission-details__info">
            <VcTypography tag="span" class="mission-details__name" text-transform="none">
              {{ row.id }}
            </VcTypography>

            <VcChip
              class="mission-details__target"
              size="sm"
              :variant="row.met ? 'solid' : 'outline'"
              :color="row.met ? 'success' : 'neutral'"
              :icon="row.met ? 'check' : undefined"
              rounded
            >
              {{ $t("pages.account.missions.sku_modal.buy_at_least", { count: row.target }) }}
            </VcChip>
          </div>

          <VcQuantityStepper
            class="mission-details__stepper"
            :model-value="row.quantity"
            :min="0"
            :max="9999"
            allow-zero
            size="sm"
            :aria-label="row.id"
            @update:model-value="setQuantity(row.id, $event)"
          />
        </li>
      </ul>

      <!-- Summary -->
      <dl class="mission-details__summary">
        <div class="mission-details__summary-row">
          <dt>{{ $t("pages.account.missions.sku_modal.total_units") }}</dt>

          <dd>{{ totalUnits }}</dd>
        </div>

        <div class="mission-details__summary-row mission-details__summary-row--total">
          <dt>{{ $t("pages.account.missions.sku_modal.targets_met") }}</dt>

          <dd :class="{ 'text-success-600': allTargetsMet }">{{ targetsMet }} / {{ rows.length }}</dd>
        </div>
      </dl>
    </div>

    <template #actions="{ close }">
      <span class="mission-details__reward" :class="{ 'mission-details__reward--met': allTargetsMet }">
        <VcIcon name="star" size="xs" class="fill-primary" />

        {{
          allTargetsMet
            ? $t("pages.account.missions.sku_modal.reward_unlocked", { points: $n(view.rewardPoints, "decimal") })
            : $t("pages.account.missions.sku_modal.reward_hint", { points: $n(view.rewardPoints, "decimal") })
        }}
      </span>

      <VcButton color="secondary" variant="outline" @click="close">
        {{ $t("pages.account.missions.sku_modal.close") }}
      </VcButton>

      <VcButton icon="cart">
        {{ $t("pages.account.missions.sku_modal.add_to_cart") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMissionCard } from "@/modules/loyalty/composables";
import type { MissionDataType } from "@/modules/loyalty/composables";

const props = defineProps<{
  mission: MissionDataType;
}>();

const { view } = useMissionCard(() => props.mission);

// SKU quantities the user intends to add, keyed by product id (seeded from progress).
const quantities = ref<Record<string, number>>({});

const items = computed(() => (props.mission.items ?? []).filter((item) => item != null));

const rows = computed(() =>
  items.value.map((item) => {
    const id = item?.productId ?? "";
    const target = item?.targetQuantity ?? 0;
    const quantity = quantities.value[id] ?? 0;

    return {
      id,
      image: "",
      target,
      quantity,
      met: target > 0 && quantity >= target,
    };
  }),
);

const totalUnits = computed(() => rows.value.reduce((sum, row) => sum + row.quantity, 0));
const targetsMet = computed(() => rows.value.filter((row) => row.met).length);
const allTargetsMet = computed(() => rows.value.length > 0 && targetsMet.value === rows.value.length);

function setQuantity(id: string, value: number | undefined): void {
  quantities.value = { ...quantities.value, [id]: value ?? 0 };
}

onMounted(() => {
  items.value.forEach((item) => {
    if (item?.productId) {
      quantities.value[item.productId] = item.currentQuantity ?? 0;
    }
  });
});
</script>

<style lang="scss">
.mission-details {
  @apply flex flex-col gap-5;

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

  &__items {
    @apply flex flex-col divide-y divide-neutral-200 border-y border-neutral-200;
  }

  &__item {
    @apply flex items-center gap-4 py-4;
  }

  &__image {
    @apply size-16 shrink-0 rounded-md border border-neutral-200 bg-additional-50 object-contain;
  }

  &__info {
    @apply flex min-w-0 flex-1 flex-col items-start gap-2;
  }

  &__name {
    @apply line-clamp-2 text-sm font-bold text-neutral-900;
  }

  &__stepper {
    @apply w-32 shrink-0;
  }

  &__summary {
    @apply flex flex-col gap-1.5 rounded-lg bg-neutral-50 p-4;
  }

  &__summary-row {
    @apply flex items-center justify-between text-sm text-neutral-600;

    dd {
      @apply font-bold text-neutral-800;
    }

    &--total {
      @apply mt-1.5 border-t border-dashed border-neutral-300 pt-2.5 text-base font-black text-neutral-900;

      dd {
        @apply font-black text-neutral-900;
      }
    }
  }

  &__reward {
    @apply me-auto flex items-center gap-2 text-sm font-bold text-neutral-500;

    &--met {
      @apply text-success-600;
    }
  }
}
</style>
