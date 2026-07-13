<template>
  <div class="missions">
    <div>
      <VcTypography tag="h1">
        {{ $t("pages.account.missions.title") }}
      </VcTypography>

      <p class="missions__description">
        {{ $t("pages.account.missions.description") }}
      </p>
    </div>

    <div class="missions__banners">
      <!-- Balance banner -->
      <div class="missions-banner missions-banner--light">
        <div class="missions-banner__icon missions-banner__icon--light">
          <VcIcon name="badge-check" class="fill-primary" :size="28" />
        </div>

        <div class="missions-banner__body">
          <span class="missions-banner__label">
            {{ $t("pages.account.missions.balance_banner.label") }}
          </span>

          <div class="missions-banner__value">
            <span v-if="balanceLoading" class="missions-banner__amount-skeleton"></span>

            <template v-else>
              <span class="missions-banner__amount">{{ $n(currentBalance ?? 0, "decimal") }}</span>

              <span class="missions-banner__unit">{{ $t("pages.account.missions.balance_banner.points") }}</span>
            </template>
          </div>
        </div>

        <router-link :to="{ name: 'PointsHistory' }" class="missions-banner__link missions-banner__link--default">
          {{ $t("pages.account.missions.balance_banner.points_history") }}
        </router-link>
      </div>

      <!-- Redeem banner -->
      <div class="missions-banner missions-banner--dark">
        <div class="missions-banner__icon missions-banner__icon--dark">
          <VcIcon name="gift" class="fill-primary" :size="28" />
        </div>

        <div class="missions-banner__body">
          <span class="missions-banner__title">
            {{ $t("pages.account.missions.redeem_banner.title") }}
          </span>

          <p class="missions-banner__subtitle">
            {{ $t("pages.account.missions.redeem_banner.description") }}
          </p>
        </div>

        <router-link :to="{ name: 'Catalog' }" class="missions-banner__link missions-banner__link--accent">
          {{ $t("pages.account.missions.redeem_banner.catalog") }}
          <VcIcon name="chevron-right" class="fill-primary" size="xs" />
        </router-link>
      </div>
    </div>

    <div class="missions__cards">
      <MissionCard v-for="mission in skuMissions" :key="mission.missionId!" :mission="mission" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useLoyaltyBalance } from "@/modules/loyalty/composables/useLoyaltyBalance";
import type { MissionDataType } from "@/modules/loyalty/composables";
import MissionCard from "@/shared/account/components/mission-card.vue";

const { fetchLoyaltyBalance, loading: balanceLoading, currentBalance } = useLoyaltyBalance();

// TODO: mock data — remove once the `loyaltyMissionProgress` query is wired up.
const skuMissions: MissionDataType[] = [
  {
    missionId: "sku-1",
    missionType: "PerSku",
    progressId: "sku-1-progress",
    name: "coffee-lovers",
    localizedName: "Stock up on our signature blends",
    description: "Buy the selected coffee blends to complete this mission.",
    bannerUrl: "",
    status: "InProgress",
    isStarted: true,
    percentage: 60,
    rewardPoints: 3000,
    startDate: "2026-07-01T00:00:00Z",
    endDate: "2026-07-31T23:59:59Z",
    periodStart: "2026-07-01T00:00:00Z",
    periodEnd: "2026-07-31T23:59:59Z",
    items: [
      { productId: "espresso-forte", currentQuantity: 2, targetQuantity: 3 },
      { productId: "house-blend", currentQuantity: 1, targetQuantity: 2 },
    ],
  },
  {
    missionId: "sku-2",
    missionType: "PerSku",
    progressId: "sku-2-progress",
    name: "brew-kit",
    localizedName: "Complete your home brewing kit",
    description: "Grab each accessory from the brewing kit selection.",
    bannerUrl: "",
    status: "Completed",
    isStarted: true,
    percentage: 100,
    rewardPoints: 5000,
    startDate: "2026-06-15T00:00:00Z",
    endDate: "2026-07-20T23:59:59Z",
    periodStart: "2026-06-15T00:00:00Z",
    periodEnd: "2026-07-20T23:59:59Z",
    completedDate: "2026-07-10T12:00:00Z",
    items: [
      { productId: "pour-over-kettle", currentQuantity: 1, targetQuantity: 1 },
      { productId: "ceramic-dripper", currentQuantity: 1, targetQuantity: 1 },
      { productId: "paper-filters", currentQuantity: 2, targetQuantity: 2 },
    ],
  },
  {
    missionId: "sku-3",
    missionType: "PerSku",
    name: "tea-sampler",
    localizedName: "Try the seasonal tea sampler",
    description: "Purchase the featured seasonal teas before the offer ends.",
    bannerUrl: "",
    status: "InProgress",
    isStarted: false,
    percentage: 25,
    rewardPoints: 1500,
    startDate: "2026-07-10T00:00:00Z",
    endDate: "2026-07-15T23:59:59Z",
    periodStart: "2026-07-10T00:00:00Z",
    periodEnd: "2026-07-15T23:59:59Z",
    items: [
      { productId: "green-sencha", currentQuantity: 1, targetQuantity: 2 },
      { productId: "chamomile-dream", currentQuantity: 0, targetQuantity: 2 },
    ],
  },
  {
    missionId: "sku-4",
    missionType: "PerSku",
    progressId: "sku-4-progress",
    name: "grinder-bundle",
    localizedName: "Grab the full grinder bundle",
    description: "Purchase every item in the grinder bundle.",
    bannerUrl: "",
    status: "Completed",
    isStarted: true,
    percentage: 100,
    rewardPoints: 4000,
    startDate: "2026-06-01T00:00:00Z",
    endDate: "2026-08-30T23:59:59Z",
    periodStart: "2026-06-01T00:00:00Z",
    periodEnd: "2026-08-30T23:59:59Z",
    completedDate: "2026-07-05T09:00:00Z",
    items: [
      { productId: "burr-grinder", currentQuantity: 1, targetQuantity: 1 },
      { productId: "cleaning-brush", currentQuantity: 1, targetQuantity: 1 },
    ],
  },
];

onMounted(async () => {
  await fetchLoyaltyBalance();
});
</script>

<style lang="scss">
.missions {
  &__description {
    @apply text-neutral-700;
  }

  &__banners {
    @apply grid grid-cols-1 gap-4 lg:grid-cols-2;
  }

  &__cards {
    @apply grid grid-cols-3 gap-4;
  }
}

.missions-banner {
  @apply flex items-center gap-4 rounded-lg border p-5 shadow-sm;

  &--light {
    @apply border-neutral-200 bg-additional-50;
  }

  &--dark {
    @apply border-transparent bg-additional-950;
  }

  &__icon {
    @apply flex size-14 shrink-0 items-center justify-center rounded-full;

    &--light {
      @apply bg-primary-50;
    }

    &--dark {
      @apply bg-additional-50/10;
    }
  }

  &__body {
    @apply flex min-w-0 flex-col;
  }

  &__label {
    @apply text-xs font-bold uppercase tracking-wide text-neutral-500;
  }

  &__value {
    @apply flex items-baseline gap-1.5;
  }

  &__amount {
    @apply text-2xl font-black text-neutral-900;
  }

  &__amount-skeleton {
    @apply h-7 w-24 animate-pulse rounded bg-neutral-200;
  }

  &__unit {
    @apply text-sm text-neutral-500;
  }

  &__title {
    @apply font-bold text-additional-50;
  }

  &__subtitle {
    @apply text-sm text-neutral-400;
  }

  &__link {
    @apply ml-auto flex shrink-0 items-center gap-1 text-sm font-bold;

    &--default {
      @apply text-[--link-color] hover:text-[--link-hover-color];
    }

    &--accent {
      @apply text-primary hover:text-primary-600;
    }
  }
}
</style>
