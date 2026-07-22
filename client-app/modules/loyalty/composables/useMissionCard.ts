import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import type { GetLoyaltyMissionProgressQuery } from "../api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export const MISSION_TYPE = {
  PerSkuAll: "PerSkuAll",
  PerSkuAny: "PerSkuAny",
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
  isCompleted: boolean;
};

const CARD_I18N = "pages.account.missions.card";

/** Below this many days left the date indicator turns red (unless the mission is completed). */
const DATE_DANGER_DAYS = 10;

type FormatCurrencyType = (value: number, currencyCode?: string) => string;

type MissionPresenterType = (
  mission: MissionDataType,
  formatCurrency: FormatCurrencyType,
) => {
  typeLabelKey: string;
  progressLabelKey: string;
  progressParams: Record<string, unknown>;
};

function presentPerSkuAll(mission: MissionDataType): ReturnType<MissionPresenterType> {
  const items = mission.items ?? [];
  const target = items.length;
  const current = items.filter((item) => item.currentQuantity === item.targetQuantity).length;

  return {
    typeLabelKey: `${CARD_I18N}.type_products`,
    progressLabelKey: `${CARD_I18N}.progress_skus`,
    progressParams: { current, target },
  };
}

function presentPerSkuAny(mission: MissionDataType): ReturnType<MissionPresenterType> {
  const target = mission.items?.length ?? 0;

  return {
    typeLabelKey: `${CARD_I18N}.type_products`,
    progressLabelKey: `${CARD_I18N}.progress_any_sku`,
    progressParams: { target },
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

function presentOrderCount(mission: MissionDataType): ReturnType<MissionPresenterType> {
  return {
    typeLabelKey: `${CARD_I18N}.type_orders`,
    progressLabelKey: `${CARD_I18N}.progress_orders`,
    progressParams: { current: mission.currentValue ?? 0, target: mission.targetValue ?? 0 },
  };
}

const PRESENTERS: Record<MissionType, MissionPresenterType> = {
  [MISSION_TYPE.PerSkuAll]: presentPerSkuAll,
  [MISSION_TYPE.PerSkuAny]: presentPerSkuAny,
  [MISSION_TYPE.OrderValue]: presentOrderValue,
  [MISSION_TYPE.OrderCount]: presentOrderCount,
};

function isCompleted(mission: MissionDataType): boolean {
  return mission.status === MISSION_STATUS.Completed;
}

function resolveDateSeverity(mission: MissionDataType, daysLeft: number | null): MissionDateSeverityType {
  if (isCompleted(mission)) {
    return "safe";
  }

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

    const present =
      PRESENTERS[(data.missionType as MissionType | undefined) ?? MISSION_TYPE.PerSkuAll] ?? presentPerSkuAll;
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
      percent: Math.round((data.percentage ?? 0) * 10) / 10,
      progressLabel: progressLabelKey ? t(progressLabelKey, progressParams) : "",
      dateLabel,
      dateSeverity: resolveDateSeverity(data, daysLeft),
      isCompleted: isCompleted(data),
    };
  });

  return { view, formatCurrency };
}
