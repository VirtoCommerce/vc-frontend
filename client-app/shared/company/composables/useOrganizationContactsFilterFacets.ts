import { cloneDeep, isEqual } from "lodash-es";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ContactStatus } from "@/shared/company";
import { translateRoleName } from "@/shared/company/composables/useCompanyMemberRoles";
import { useOrganizationContactRoles } from "@/shared/company/composables/useOrganizationContactRoles";
import type { FacetItemType, FacetValueItemType } from "@/core/types";

function mergeFacetValue(currentFacet: FacetItemType, updatedValue: FacetValueItemType): FacetValueItemType {
  const currentValue = currentFacet.values.find((value) => value.value === updatedValue.value);
  return currentValue ? { ...updatedValue, selected: currentValue.selected } : cloneDeep(updatedValue);
}

function mergeFacet(current: FacetItemType[], updatedFacet: FacetItemType): FacetItemType {
  const currentFacet = current.find((facet) => facet.paramName === updatedFacet.paramName);
  if (!currentFacet) {
    return cloneDeep(updatedFacet);
  }

  return {
    ...updatedFacet,
    values: updatedFacet.values.map((updatedValue) => mergeFacetValue(currentFacet, updatedValue)),
  };
}

function mergeFacetList(current: FacetItemType[], updated: FacetItemType[]): FacetItemType[] {
  return updated.map((updatedFacet) => mergeFacet(current, updatedFacet));
}

export function useOrganizationContactsFilterFacets(organizationId: string) {
  const { t, te } = useI18n();
  const { contactRoles } = useOrganizationContactRoles(organizationId);

  const initialFacets = computed<FacetItemType[]>(() => {
    const facets: FacetItemType[] = [
      {
        label: t("pages.company.members.labels.role"),
        paramName: "roleId",
        type: "terms",
        values: contactRoles.value.map((role) => ({
          label: translateRoleName(t, te, role),
          value: role.id,
          selected: false,
        })),
      },
      {
        label: t("pages.company.members.labels.status"),
        paramName: "status",
        type: "terms",
        values: [
          { label: t("pages.company.members.statuses.active"), value: ContactStatus.Approved, selected: false },
          { label: t("pages.company.members.statuses.invited"), value: ContactStatus.Invited, selected: false },
          { label: t("pages.company.members.statuses.blocked"), value: ContactStatus.Locked, selected: false },
        ],
      },
    ];

    return facets.filter((facet) => facet.values.length > 0);
  });

  const appliedFacets = ref<FacetItemType[]>(cloneDeep(initialFacets.value));
  const selectableFacets = ref<FacetItemType[]>(cloneDeep(initialFacets.value));

  watch(contactRoles, mergeFacetsWithLatest, { once: true });

  function mergeFacetsWithLatest() {
    appliedFacets.value = mergeFacetList(appliedFacets.value, initialFacets.value);
    selectableFacets.value = mergeFacetList(selectableFacets.value, initialFacets.value);
  }

  const isFacetsDirty = computed<boolean>(() => {
    return !isEqual(appliedFacets.value, selectableFacets.value);
  });

  const numberOfFacetsApplied = computed<number>(() =>
    appliedFacets.value.reduce((result, filterFacet) => {
      return result + filterFacet.values.filter((value) => value.selected).length;
    }, 0),
  );

  function applyFacets() {
    if (isFacetsDirty.value) {
      appliedFacets.value = cloneDeep(selectableFacets.value);
    }
  }

  function resetFacets() {
    appliedFacets.value = cloneDeep(initialFacets.value);
    selectableFacets.value = cloneDeep(initialFacets.value);
  }

  function resetSelectableToAppliedFacets() {
    selectableFacets.value = cloneDeep(appliedFacets.value);
  }

  function resetFacetItem(payload: Pick<FacetItemType, "paramName"> & Pick<FacetValueItemType, "value">) {
    const facet = appliedFacets.value.find((item) => item.paramName === payload.paramName);
    const facetValue = facet?.values.find((item) => item.value === payload.value);

    if (!facetValue?.selected) {
      return;
    }

    facetValue.selected = false;
    resetSelectableToAppliedFacets();
  }

  return {
    selectableFacets,
    isFacetsDirty,
    numberOfFacetsApplied,
    applyFacets,
    resetFacets,
    resetSelectableToAppliedFacets,
    resetFacetItem,
    appliedFacets: computed(() => appliedFacets.value),
  };
}
