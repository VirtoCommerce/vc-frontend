import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, defineComponent, ref } from "vue";
import MissionCard from "./mission-card.vue";
import OrderMissionModal from "./order-mission-modal.vue";

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

function expectProgress(root: HTMLElement) {
  const progress = root.querySelector<HTMLProgressElement>("progress");

  expect(progress).not.toBeNull();
  expect(progress!.value).toBe(30);
  expect(progress!.max).toBe(100);
  expect(root.querySelector('[class$="__track"]')?.getAttribute("aria-hidden")).toBe("true");

  return progress!;
}

describe("VCST-6143: mission progress bars expose a native progress element", () => {
  it("mission card progress is a native progress named by the mission title", () => {
    const wrapper = mount(MissionCard, {
      props: { mission: { missionId: "1", missionType: "OrderCount" } as never },
      global,
      attachTo: document.body,
    });

    const progress = expectProgress(wrapper.element as HTMLElement);
    const labelledBy = progress.getAttribute("aria-labelledby");

    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent?.trim()).toBe("Spring mission");

    wrapper.unmount();
  });

  it("order mission modal progress is a native progress named by the mission title", () => {
    const wrapper = mount(OrderMissionModal, {
      props: { mission: { missionId: "1", missionType: "OrderCount", targetValue: 10 } as never },
      global,
    });

    const progress = expectProgress(wrapper.element as HTMLElement);

    expect(progress.getAttribute("aria-label")).toBe("Spring mission");
  });

  it("gives each mission card on one page its own title id", () => {
    const MissionList = defineComponent({
      components: { MissionCard },
      template: `<div><MissionCard :mission="{ missionId: '1' }" /><MissionCard :mission="{ missionId: '2' }" /></div>`,
    });
    const wrapper = mount(MissionList, { global });

    const ids = wrapper.findAll("progress").map((progress) => progress.attributes("aria-labelledby"));

    expect(ids).toHaveLength(2);
    expect(ids[0]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
  });
});
