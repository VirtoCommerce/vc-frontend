import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import MissionCard from "./mission-card.vue";
import VcIcon from "@/ui-kit/components/atoms/icon/vc-icon.vue";

const isCompleted = ref(false);

vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useThemeContext: () => ({ themeContext: ref({ settings: {} }) }),
}));

vi.mock("../composables", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useMissionCard: () => ({
    view: computed(() => ({
      bannerUrl: "",
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
      components: { VcIcon },
      stubs: {
        VcImage: true,
        VcChip: true,
        VcIcon: true,
        VcTypography: true,
        VcButton: true,
        MissionDateBadge: true,
      },
      mocks: { $t: (key: string) => key, $n: (value: number) => String(value) },
    },
  });
}

function findCheckGlyph(wrapper: ReturnType<typeof mountCard>) {
  return wrapper.findAllComponents(VcIcon).find((icon) => icon.props("name") === "circle-check");
}

beforeEach(() => {
  isCompleted.value = false;
});

// The completed check must sit on a solid disc so its contrast (WCAG 1.4.11, 3:1)
// does not depend on the banner art showing through the translucent scrim.
describe("MissionCard completed mark", () => {
  it("draws the check glyph on a solid disc for a completed mission", () => {
    isCompleted.value = true;
    const glyph = findCheckGlyph(mountCard());

    expect(glyph).toBeDefined();
    expect(glyph?.element.parentElement?.classList.contains("mission-card__check")).toBe(true);
  });

  it("draws no completed mark for a mission in progress", () => {
    expect(findCheckGlyph(mountCard())).toBeUndefined();
  });
});
