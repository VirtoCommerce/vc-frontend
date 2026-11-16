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
  loading: Ref<boolean>;
};

/**
 * The Company → Reporting selection kept in the URL (`?period=`, `?member=`), so a link opens the same view. An
 * unknown period reads as the default. A member counts only once the member list has it: until then the report waits,
 * and a member the loaded list lacks (or a failed list) falls back to All members.
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

  const isMemberConfirmed = computed(() => members.options.value.some((option) => option.id === memberId.value));

  /** The member the report is narrowed to: undefined for All members and for a member the list does not have. */
  const reportMemberId = computed(() => (isMemberConfirmed.value ? memberId.value : undefined));

  /** A member from the URL the list has not confirmed yet: the report waits for the list. */
  const isMemberPending = computed(
    () => memberId.value !== COMPANY_REPORTING_ALL_MEMBERS && !isMemberConfirmed.value && members.loading.value,
  );

  // The server refuses a report for a contact outside the organization, and the picker would show it blank.
  watch(
    [memberId, isMemberConfirmed, members.loading],
    () => {
      if (members.loading.value || memberId.value === COMPANY_REPORTING_ALL_MEMBERS || isMemberConfirmed.value) {
        return;
      }
      memberId.value = COMPANY_REPORTING_ALL_MEMBERS;
    },
    { immediate: true },
  );

  return { period, memberId, reportMemberId, isMemberPending };
}
