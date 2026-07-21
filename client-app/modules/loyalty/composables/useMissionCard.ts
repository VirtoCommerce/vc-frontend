import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import type { GetLoyaltyMissionProgressQuery } from "../api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export const MISSION_TYPE = {
  PerSku: "PerSku",
  OrderValue: "OrderValue",
  OrderCount: "OrderCount",
} as const;

export type MissionType = (typeof MISSION_TYPE)[keyof typeof MISSION_TYPE];

export const MISSION_STATUS = {
  InProgress: "InProgress",
  Completed: "Completed",
  Expired: "Expired",
} as const;

export type MissionStatusType = (typeof MISSION_STATUS)[keyof typeof MISSION_STATUS];

export type MissionDataType = NonNullable<
  NonNullable<GetLoyaltyMissionProgressQuery["loyaltyMissionProgress"]>["items"]
>[number];

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

type FormatCurrencyType = (value: number, currencyCode?: string) => string;

/**
 * Per-type presenter: everything that differs between mission types lives here.
 * It returns an i18n key (translated later) plus the interpolation params for it.
 * Add a presenter per new `MissionType` — the rest of the composable is shared.
 */
type MissionPresenterType = (
  mission: MissionDataType,
  formatCurrency: FormatCurrencyType,
) => {
  typeLabelKey: string;
  progressLabelKey: string;
  progressParams: Record<string, unknown>;
};

function presentPerSku(mission: MissionDataType): ReturnType<MissionPresenterType> {
  const items = mission.items ?? [];
  const current = items.reduce((sum, item) => sum + item.currentQuantity, 0);
  const target = items.reduce((sum, item) => sum + item.targetQuantity, 0);

  return {
    typeLabelKey: `${CARD_I18N}.type_products`,
    progressLabelKey: `${CARD_I18N}.progress_skus`,
    progressParams: { current, target },
  };
}

function presentOrderValue(
  mission: MissionDataType,
  formatCurrency: FormatCurrencyType,
): ReturnType<MissionPresenterType> {
  const sum = formatCurrency(mission.currentValue ?? 0, mission.missionCurrency?.code);

  return {
    typeLabelKey: `${CARD_I18N}.type_order_value`,
    progressLabelKey: `${CARD_I18N}.progress_spend`,
    progressParams: { sum },
  };
}

// TODO: implement once "OrderCount" missions are available on the backend.
function presentOrderCount(mission: MissionDataType): ReturnType<MissionPresenterType> {
  return {
    typeLabelKey: `${CARD_I18N}.type_orders`,
    progressLabelKey: `${CARD_I18N}.progress_orders`,
    progressParams: { current: mission.currentValue ?? 0, target: mission.targetValue ?? 0 },
  };
}

const PRESENTERS: Record<MissionType, MissionPresenterType> = {
  [MISSION_TYPE.PerSku]: presentPerSku,
  [MISSION_TYPE.OrderValue]: presentOrderValue,
  [MISSION_TYPE.OrderCount]: presentOrderCount,
};

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
  const { t, n } = useI18n();

  function formatCurrency(value: number, currencyCode?: string): string {
    return currencyCode ? n(value, { key: "currency", currency: currencyCode }) : n(value, "decimal");
  }

  const view = computed<MissionCardViewType>(() => {
    const data = toValue(mission);

    const present = PRESENTERS[(data.missionType as MissionType | undefined) ?? MISSION_TYPE.PerSku] ?? presentPerSku;
    const { typeLabelKey, progressLabelKey, progressParams } = present(data, formatCurrency);

    const daysLeft = data.daysRemaining ?? null;

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
      rewardPoints: data.rewardPoints?.amount ?? 0,
      percent: data.percentage ?? 0,
      progressLabel: t(progressLabelKey, progressParams),
      dateLabel,
      dateSeverity: resolveDateSeverity(data, daysLeft),
    };
  });

  return { view, formatCurrency };
}
