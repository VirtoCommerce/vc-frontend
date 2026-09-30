import { computed } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepTaskTypesDocument } from "../api/graphql/types";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";

/**
 * The task-type vocabulary, from the TaskManagement.TaskTypes settings dictionary. Static per deployment, so
 * cache-first like the other rule/vocabulary lists. An administrator can add values at runtime — the shipped
 * defaults are back-office flavoured and none of them fit a sales rep, so an empty-looking list usually means
 * nobody has configured it yet, not that the query failed.
 */
export function useSalesRepTaskTypes() {
  const { result, onError } = useSalesRepHubQuery(
    SalesRepTaskTypesDocument,
    computed(() => ({})),
    { fetchPolicy: "cache-first" },
  );

  onError((err) => {
    Logger.error("[sales-rep] salesRepTaskTypes failed:", err);
  });

  const types = computed<string[]>(() =>
    (result.value?.salesRepTaskTypes ?? []).filter((value): value is string => Boolean(value)),
  );

  return { types };
}
