import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, nextTick, ref } from "vue";
import MissionCard from "./mission-card.vue";
import VcImage from "@/ui-kit/components/atoms/image/vc-image.vue";

const bannerUrl = ref("");

vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useThemeContext: () => ({ themeContext: ref({ settings: {} }) }),
}));

vi.mock("../composables", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useMissionCard: () => ({
    view: computed(() => ({
      bannerUrl: bannerUrl.value,
      isCompleted: false,
      rewardPoints: 1,
      typeLabel: "type",
      progressLabel: "progress",
      percent: 10,
      title: "title",
      dateSeverity: "neutral",
      dateLabel: "date",
    })),
  }),
}));

function mountCard() {
  return mount(MissionCard, {
    props: { mission: { missionId: "1" } as never },
    global: {
      components: { VcImage },
      stubs: { VcChip: true, VcIcon: true, VcTypography: true, VcButton: true, MissionDateBadge: true },
      mocks: { $t: (key: string) => key, $n: (value: number) => String(value) },
    },
  });
}

beforeEach(() => {
  bannerUrl.value = "";
});

describe("MissionCard banner", () => {
  it("draws no blurred backdrop when the mission has no banner", () => {
    expect(mountCard().findAll("img")).toHaveLength(1);
  });

  it("drops the blurred backdrop when the banner fails to load", async () => {
    bannerUrl.value = "https://example.com/missing.png";
    const wrapper = mountCard();

    expect(wrapper.findAll("img")).toHaveLength(2);

    await wrapper.find(".mission-card__backdrop").trigger("error");
    await nextTick();

    const images = wrapper.findAll("img");
    expect(images).toHaveLength(1);
    expect(images[0].classes()).toContain("mission-card__image");
  });
});
