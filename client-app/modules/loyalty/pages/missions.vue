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
        <MissionsBanner
          variant="light"
          icon="badge-check"
          :link-to="{ name: 'PointsHistory' }"
          :link-text="$t('pages.account.missions.balance_banner.points_history')"
        >
          <PointsBalance :balance="currentBalance" :loading="balanceLoading" />
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
import PointsBalance from "../components/points-balance.vue";
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
</style>
