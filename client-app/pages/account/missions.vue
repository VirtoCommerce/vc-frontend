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
      <MissionCard v-for="mission in missions" :key="mission.missionId!" :mission="mission" />
    </div>

    <VcPagination
      v-if="pagesCount > 1"
      :page="page"
      :pages="pagesCount"
      class="missions__pagination"
      @update:page="changePage"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useLoyaltyBalance } from "@/modules/loyalty/composables/useLoyaltyBalance";
import { useMissions } from "@/modules/loyalty/composables/useMissions";
import MissionCard from "@/shared/account/components/mission-card.vue";

const { fetchLoyaltyBalance, loading: balanceLoading, currentBalance } = useLoyaltyBalance();
const { fetchMissions, missions, page, pagesCount } = useMissions();

async function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await fetchMissions();
}

onMounted(async () => {
  await Promise.all([fetchLoyaltyBalance(), fetchMissions()]);
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
    @apply grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3;
  }

  &__pagination {
    @apply mt-5;
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
