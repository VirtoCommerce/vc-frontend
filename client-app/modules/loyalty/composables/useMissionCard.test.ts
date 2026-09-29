import { describe, it, expect, vi } from "vitest";
import { MISSION_STATUS, MISSION_TYPE, useMissionCard } from "./useMissionCard";
import type { MissionDataType } from "./useMissionCard";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    n: (value: number) => String(value),
  }),
}));

// Codegen types daysRemaining as optional, the backend sends an explicit null for open-ended missions.
type MissionOverridesType = Partial<Omit<MissionDataType, "daysRemaining">> & { daysRemaining?: number | null };

function createMission(mission: MissionOverridesType): MissionDataType {
  return {
    missionType: MISSION_TYPE.OrderCount,
    status: MISSION_STATUS.InProgress,
    currentValue: 1,
    targetValue: 3,
    ...mission,
  } as unknown as MissionDataType;
}

describe("useMissionCard", () => {
  it("labels a mission with a deadline", () => {
    const { view } = useMissionCard(createMission({ daysRemaining: 21 }));

    expect(view.value.dateLabel).toBe("pages.account.missions.card.days_left");
    expect(view.value.dateSeverity).toBe("warning");
  });

  it("labels an open-ended mission instead of leaving the status dot on its own", () => {
    const { view } = useMissionCard(createMission({ daysRemaining: null }));

    expect(view.value.dateLabel).toBe("pages.account.missions.card.no_deadline");
    expect(view.value.dateSeverity).toBe("warning");
  });

  it("labels a completed mission", () => {
    const { view } = useMissionCard(createMission({ status: MISSION_STATUS.Completed, daysRemaining: 5 }));

    expect(view.value.dateLabel).toBe("pages.account.missions.card.mission_completed");
    expect(view.value.dateSeverity).toBe("success");
  });

  it("keeps an open-ended completed mission completed", () => {
    const { view } = useMissionCard(createMission({ status: MISSION_STATUS.Completed, daysRemaining: null }));

    expect(view.value.dateLabel).toBe("pages.account.missions.card.mission_completed");
    expect(view.value.dateSeverity).toBe("success");
  });

  it("still counts the last day down", () => {
    const { view } = useMissionCard(createMission({ daysRemaining: 0 }));

    expect(view.value.dateLabel).toBe("pages.account.missions.card.days_left");
    expect(view.value.dateSeverity).toBe("danger");
  });

  it("does not present an expired mission as completed", () => {
    const { view } = useMissionCard(createMission({ status: MISSION_STATUS.Expired, daysRemaining: -3 }));

    expect(view.value.dateLabel).toBe("pages.account.missions.card.days_left");
    expect(view.value.dateSeverity).toBe("danger");
  });

  it("turns the severity to danger below the danger threshold", () => {
    expect(useMissionCard(createMission({ daysRemaining: 10 })).view.value.dateSeverity).toBe("warning");
    expect(useMissionCard(createMission({ daysRemaining: 9 })).view.value.dateSeverity).toBe("danger");
  });
});
