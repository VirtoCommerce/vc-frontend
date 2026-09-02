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

    <VcEmptyView v-if="loadError" variant="error" :text="$t('pages.account.missions.load_error')">
      <template #button>
        <VcButton @click="loadData">{{ $t("pages.account.missions.retry_button") }}</VcButton>
      </template>
    </VcEmptyView>

    <template v-else>
      <div class="missions__banners">
        <MissionsBanner variant="light" icon="badge-check">
          <span class="missions-balance__label">
            {{ $t("pages.account.missions.balance_banner.label") }}
          </span>

          <div class="missions-balance__value">
            <span v-if="balanceLoading" class="missions-balance__amount-skeleton"></span>

            <template v-else>
              <span class="missions-balance__amount">{{ $n(currentBalance ?? 0, "decimal") }}</span>

              <span class="missions-balance__unit">{{ $t("pages.account.missions.balance_banner.points") }}</span>
            </template>
          </div>

          <template #link>
            <router-link :to="{ name: 'PointsHistory' }" class="missions-banner__link missions-banner__link--default">
              {{ $t("pages.account.missions.balance_banner.points_history") }}
            </router-link>
          </template>
        </MissionsBanner>

        <MissionsBanner
          variant="dark"
          icon="gift"
          :title="$t('pages.account.missions.redeem_banner.title')"
          :description="$t('pages.account.missions.redeem_banner.description')"
        />
      </div>

      <VcEmptyView
        v-if="!missionsLoading && !missions.length"
        icon="outline-lists"
        :text="$t('pages.account.missions.empty_list')"
      />

      <template v-else>
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
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import MissionCard from "../components/mission-card.vue";
import MissionsBanner from "../components/missions-banner.vue";
import { useLoyaltyBalance } from "../composables/useLoyaltyBalance";
import { useMissions } from "../composables/useMissions";

const { fetchLoyaltyBalance, loading: balanceLoading, currentBalance } = useLoyaltyBalance();
const { fetchMissions, missions, page, pagesCount, loading: missionsLoading } = useMissions();

const loadError = ref(false);

async function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await fetchMissions();
}

async function loadData() {
  loadError.value = false;

  try {
    await Promise.all([fetchLoyaltyBalance(), fetchMissions()]);
  } catch {
    loadError.value = true;
  }
}

onMounted(loadData);
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

.missions-balance {
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
}
</style>
