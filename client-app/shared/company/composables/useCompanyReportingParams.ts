import { computed, watch } from "vue";
import { useRouteQueryParam } from "@/core/composables/useRouteQueryParam";
import { isReportingPeriod, REPORTING_DEFAULT_PERIOD } from "@/shared/reporting";
import type { OrganizationMemberOptionType } from "./useOrganizationMemberOptions";
import type { ReportingPeriodType } from "@/shared/reporting";
import type { Ref } from "vue";

/** The member picker's "All members": the whole organization. */
export const COMPANY_REPORTING_ALL_MEMBERS = "";

type MemberOptionsType = {
  options: Ref<OrganizationMemberOptionType[]>;
  totalCount: Ref<number>;
  loading: Ref<boolean>;
  failed: Ref<boolean>;
};

/**
 * The Company → Reporting selection kept in the URL (`?period=`, `?member=`), so a link opens the same view. An
 * unknown period reads as the default; an unknown member does once the complete member list shows it is not one.
 */
export function useCompanyReportingParams(members: MemberOptionsType) {
  const periodParam = useRouteQueryParam<string>("period", {
    defaultValue: REPORTING_DEFAULT_PERIOD,
    updateMethod: "replace",
  });

  // Guarded here, not by the param's validator, which an empty value (`?period=`) skips.
  const period = computed<ReportingPeriodType>({
    get: () => (isReportingPeriod(periodParam.value) ? periodParam.value : REPORTING_DEFAULT_PERIOD),
    set: (value) => {
      periodParam.value = value;
    },
  });

  const memberId = useRouteQueryParam<string>("member", {
    defaultValue: COMPANY_REPORTING_ALL_MEMBERS,
    // A repeated `?member=` arrives as an array.
    validator: (value) => typeof value === "string",
    updateMethod: "replace",
  });

  // A member who left (or a mistyped id) would leave a blank picker over a report the server refuses. Only a complete
  // list can tell: past the options limit the id may still be a member's.
  watch(
    [memberId, members.options, members.loading, members.failed],
    () => {
      if (members.loading.value || members.failed.value || memberId.value === COMPANY_REPORTING_ALL_MEMBERS) {
        return;
      }
      const isComplete = members.options.value.length >= members.totalCount.value;
      const isKnown = members.options.value.some((option) => option.id === memberId.value);
      if (isComplete && !isKnown) {
        memberId.value = COMPANY_REPORTING_ALL_MEMBERS;
      }
    },
    { immediate: true },
  );

  return { period, memberId };
}
