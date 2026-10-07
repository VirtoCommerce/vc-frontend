import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import MissionCardSkeleton from "../components/mission-card-skeleton.vue";
import MissionCard from "../components/mission-card.vue";
import { DEFAULT_MISSIONS_PER_PAGE } from "../constants";
import Missions from "./missions.vue";
import type { MissionDataType } from "../composables";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    loading: ref(false),
    missions: ref<MissionDataType[]>([]),
  };
});

vi.mock("../composables/useMissions", async () => {
  const { computed, ref } = await import("vue");
  return {
    useMissions: () => ({
      fetchMissions: vi.fn(),
      loading: computed(() => state.loading.value),
      missions: computed(() => state.missions.value),
      page: ref(1),
      pagesCount: ref(1),
    }),
  };
});

vi.mock("../composables/useLoyaltyBalance", async () => {
  const { ref } = await import("vue");
  return {
    useLoyaltyBalance: () => ({
      fetchLoyaltyBalance: vi.fn(),
      loading: ref(false),
      currentBalance: ref(0),
    }),
  };
});

const createWrapper = createWrapperFactory(mount, Missions, {
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcTypography: true,
      VcButton: true,
      VcEmptyView: true,
      VcPagination: true,
      MissionCard: true,
      MissionsBanner: true,
    },
  },
});

beforeEach(() => {
  state.loading.value = false;
  state.missions.value = [];
});

describe("Missions card grid", () => {
  it("renders a page of card skeletons while the missions load", () => {
    state.loading.value = true;

    const wrapper = createWrapper();

    expect(wrapper.findAllComponents(MissionCardSkeleton)).toHaveLength(DEFAULT_MISSIONS_PER_PAGE);
    expect(wrapper.findAllComponents(MissionCard)).toHaveLength(0);
  });

  it("replaces the skeletons with the loaded mission cards", () => {
    state.missions.value = [{ missionId: "1" }, { missionId: "2" }] as MissionDataType[];

    const wrapper = createWrapper();

    expect(wrapper.findAllComponents(MissionCardSkeleton)).toHaveLength(0);
    expect(wrapper.findAllComponents(MissionCard)).toHaveLength(2);
  });
});
