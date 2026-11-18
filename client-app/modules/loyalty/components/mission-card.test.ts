import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, nextTick, ref } from "vue";
import MissionCard from "./mission-card.vue";
import VcIcon from "@/ui-kit/components/atoms/icon/vc-icon.vue";
import VcImage from "@/ui-kit/components/atoms/image/vc-image.vue";

const bannerUrl = ref("");
const isCompleted = ref(false);

vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useThemeContext: () => ({ themeContext: ref({ settings: {} }) }),
}));

vi.mock("../composables", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useMissionCard: () => ({
    view: computed(() => ({
      bannerUrl: bannerUrl.value,
      isCompleted: isCompleted.value,
      rewardPoints: 1,
      typeLabel: "type",
      progressLabel: "progress",
      percent: isCompleted.value ? 100 : 10,
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
      components: { VcImage, VcIcon },
      stubs: { VcChip: true, VcIcon: true, VcTypography: true, VcButton: true, MissionDateBadge: true },
      mocks: { $t: (key: string) => key, $n: (value: number) => String(value) },
    },
  });
}

beforeEach(() => {
  bannerUrl.value = "";
  isCompleted.value = false;
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

// The completed check must sit on a solid disc so its contrast (WCAG 1.4.11, 3:1)
// does not depend on the banner art showing through the translucent scrim.
describe("MissionCard completed mark", () => {
  it("draws the check glyph on a solid disc for a completed mission", () => {
    isCompleted.value = true;
    const check = mountCard().find('[data-test-id="mission-card-check"]');

    expect(check.exists()).toBe(true);
    expect(check.findComponent(VcIcon).props("name")).toBe("circle-check");
  });

  it("draws no completed mark for a mission in progress", () => {
    expect(mountCard().find('[data-test-id="mission-card-check"]').exists()).toBe(false);
  });
});
