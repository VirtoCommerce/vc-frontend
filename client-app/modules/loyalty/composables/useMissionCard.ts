import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import type { LoyaltyUserMission } from "../api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

/**
 * `missionType` and `rewardPoints` are not part of the GraphQL schema yet
 * (see the loyalty types review). They are added on top of the generated type
 * so the UI can already work with them; drop the extension once the backend
 * exposes these fields.
 */
export const MISSION_TYPE = {
  PerSku: "PerSku",
  Spend: "Spend",
  OrderCount: "OrderCount",
} as const;

export type MissionType = (typeof MISSION_TYPE)[keyof typeof MISSION_TYPE];

export const MISSION_STATUS = {
  InProgress: "InProgress",
  Completed: "Completed",
  Expired: "Expired",
} as const;

export type MissionStatusType = (typeof MISSION_STATUS)[keyof typeof MISSION_STATUS];

export type MissionDataType = LoyaltyUserMission & {
  missionType?: MissionType;
  rewardPoints?: number;
};

export type MissionDateSeverityType = "safe" | "warning" | "danger";

export type MissionCardViewType = {
  typeLabel: string;
  title: string;
  bannerUrl: string;
  rewardPoints: number;
  percent: number;
  progressLabel: string;
  dateLabel: string;
  dateSeverity: MissionDateSeverityType;
};

const CARD_I18N = "pages.account.missions.card";

/** Below this many days left the date indicator turns red (unless the mission is completed). */
const DATE_DANGER_DAYS = 10;
const MS_PER_DAY = 86_400_000;

/**
 * Per-type presenter: everything that differs between mission types lives here.
 * It returns i18n keys (translated later) plus the raw progress numbers.
 * Add a presenter per new `MissionType` — the rest of the composable is shared.
 */
type MissionPresenterType = (mission: MissionDataType) => {
  typeLabelKey: string;
  current: number;
  target: number;
  progressLabelKey: string;
};

function presentPerSku(mission: MissionDataType): ReturnType<MissionPresenterType> {
  const items = (mission.items ?? []).filter((item) => item != null);
  const current = items.reduce((sum, item) => sum + (item?.currentQuantity ?? 0), 0);
  const target = items.reduce((sum, item) => sum + (item?.targetQuantity ?? 0), 0);

  return {
    typeLabelKey: `${CARD_I18N}.type_products`,
    current,
    target,
    progressLabelKey: `${CARD_I18N}.progress_skus`,
  };
}

// TODO: implement once "Spend" missions are available on the backend.
function presentSpend(mission: MissionDataType): ReturnType<MissionPresenterType> {
  return {
    typeLabelKey: `${CARD_I18N}.type_order_value`,
    current: mission.currentValue ?? 0,
    target: mission.targetValue ?? 0,
    progressLabelKey: `${CARD_I18N}.progress_spend`,
  };
}

// TODO: implement once "OrderCount" missions are available on the backend.
function presentOrderCount(mission: MissionDataType): ReturnType<MissionPresenterType> {
  return {
    typeLabelKey: `${CARD_I18N}.type_orders`,
    current: mission.currentValue ?? 0,
    target: mission.targetValue ?? 0,
    progressLabelKey: `${CARD_I18N}.progress_orders`,
  };
}

const PRESENTERS: Record<MissionType, MissionPresenterType> = {
  [MISSION_TYPE.PerSku]: presentPerSku,
  [MISSION_TYPE.Spend]: presentSpend,
  [MISSION_TYPE.OrderCount]: presentOrderCount,
};

function resolveDaysLeft(mission: MissionDataType): number | null {
  const end = mission.endDate ?? mission.periodEnd;

  if (!end) {
    return null;
  }

  return Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / MS_PER_DAY));
}

function isCompleted(mission: MissionDataType): boolean {
  return mission.status === MISSION_STATUS.Completed;
}

function resolveDateSeverity(mission: MissionDataType, daysLeft: number | null): MissionDateSeverityType {
  // Green is reserved for finished missions.
  if (isCompleted(mission)) {
    return "safe";
  }

  // Otherwise the indicator is yellow by default and turns red as the deadline approaches.
  if (daysLeft !== null && daysLeft < DATE_DANGER_DAYS) {
    return "danger";
  }

  return "warning";
}

export function useMissionCard(mission: MaybeRefOrGetter<MissionDataType>) {
  const { t } = useI18n();

  const view = computed<MissionCardViewType>(() => {
    const data = toValue(mission);

    // Until the backend adds `missionType`, we only handle SKU missions.
    const present = PRESENTERS[data.missionType ?? MISSION_TYPE.PerSku] ?? presentPerSku;
    const { typeLabelKey, current, target, progressLabelKey } = present(data);

    const percent = Math.min(
      100,
      Math.max(0, Math.round(data.percentage ?? (target > 0 ? (current / target) * 100 : 0))),
    );

    const daysLeft = resolveDaysLeft(data);

    let dateLabel = "";
    if (isCompleted(data)) {
      dateLabel = t(`${CARD_I18N}.mission_completed`);
    } else if (daysLeft !== null) {
      dateLabel = t(`${CARD_I18N}.days_left`, daysLeft);
    }

    return {
      typeLabel: t(typeLabelKey),
      title: data.localizedName ?? data.name ?? "",
      bannerUrl: data.bannerUrl ?? "",
      rewardPoints: data.rewardPoints ?? 0,
      percent,
      progressLabel: t(progressLabelKey, { current, target }),
      dateLabel,
      dateSeverity: resolveDateSeverity(data, daysLeft),
    };
  });

  return { view };
}
