import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, defineComponent, ref } from "vue";
import MissionCard from "./mission-card.vue";
import OrderMissionModal from "./order-mission-modal.vue";
import type { VueWrapper } from "@vue/test-utils";

vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useThemeContext: () => ({ themeContext: ref({ settings: {} }) }),
}));

vi.mock("@/shared/modal", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useCloseModalOnRouteChange: () => undefined,
  useModal: () => ({ openModal: () => undefined }),
}));

vi.mock("../composables", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useMissionCard: () => ({
    view: computed(() => ({
      bannerUrl: "",
      isCompleted: false,
      rewardPoints: 1,
      typeLabel: "type",
      progressLabel: "3 of 10",
      percent: 30,
      title: "Spring mission",
      dateSeverity: "neutral",
      dateLabel: "date",
    })),
  }),
}));

const VcTypographyStub = defineComponent({
  props: { tag: { type: String, default: "span" } },
  template: `<component :is="tag"><slot /></component>`,
});

const VcModalStub = defineComponent({
  props: { title: { type: String, default: "" } },
  template: `<div role="dialog"><h2>{{ title }}</h2><slot :close="() => {}" /></div>`,
});

const global = {
  stubs: {
    VcImage: true,
    VcChip: true,
    VcIcon: true,
    VcButton: true,
    MissionDateBadge: true,
    VcTypography: VcTypographyStub,
    VcModal: VcModalStub,
  },
  mocks: { $t: (key: string) => key, $n: (value: number) => String(value) },
};

vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

function mountMissionCard() {
  return mount(MissionCard, {
    props: { mission: { missionId: "1", missionType: "OrderCount" } as never },
    global,
  });
}

function mountOrderMissionModal() {
  return mount(OrderMissionModal, {
    props: { mission: { missionId: "1", missionType: "OrderCount", targetValue: 10 } as never },
    global,
  });
}

function mountMissionList() {
  const MissionList = defineComponent({
    components: { MissionCard },
    template: `<div><MissionCard :mission="{ missionId: '1' }" /><MissionCard :mission="{ missionId: '2' }" /></div>`,
  });

  return mount(MissionList, { global });
}

function expectProgress(wrapper: VueWrapper, trackTestId: string) {
  const progress = wrapper.find<HTMLProgressElement>("progress");

  expect(progress.exists()).toBe(true);
  expect(progress.element.value).toBe(30);
  expect(progress.element.max).toBe(100);
  expect(wrapper.find(`[data-test-id="${trackTestId}"]`).attributes("aria-hidden")).toBe("true");

  return progress;
}

describe("mission progress bar", () => {
  it("mission card progress is a native progress named by the mission title", () => {
    const wrapper = mountMissionCard();

    const progress = expectProgress(wrapper, "mission-card-progress-track");
    const labelledBy = progress.attributes("aria-labelledby");

    expect(labelledBy).toBeTruthy();
    expect(wrapper.find(`#${labelledBy}`).text()).toBe("Spring mission");
  });

  it("order mission modal progress is a native progress named by the mission title", () => {
    const wrapper = mountOrderMissionModal();

    const progress = expectProgress(wrapper, "order-mission-modal-progress-track");

    expect(progress.attributes("aria-label")).toBe("Spring mission");
  });

  it("hides the visible percent text from assistive tech", () => {
    for (const wrapper of [mountMissionCard(), mountOrderMissionModal()]) {
      const percent = wrapper.findAll("span").find((span) => span.text() === "30%");

      expect(percent?.attributes("aria-hidden")).toBe("true");
    }
  });

  it("gives each mission card on one page its own title id", () => {
    const wrapper = mountMissionList();

    const ids = wrapper.findAll("progress").map((progress) => progress.attributes("aria-labelledby"));

    expect(ids).toHaveLength(2);
    expect(ids[0]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
  });
});
