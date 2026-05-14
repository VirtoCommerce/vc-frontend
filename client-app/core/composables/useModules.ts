import { createGlobalState } from "@vueuse/core";
import { computed, shallowRef } from "vue";
import { getOutdatedModules } from "@/core/utilities";
import type { InitializeApplicationQuery } from "@/core/api/graphql/types";

type BackendModuleType = NonNullable<NonNullable<InitializeApplicationQuery["store"]>["settings"]["modules"]>[number];

function _useModules() {
  const modules = shallowRef<BackendModuleType[]>([]);

  function setModules(payload: readonly BackendModuleType[] | null | undefined) {
    modules.value = payload ? [...payload] : [];
  }

  return {
    modules: computed(() => modules.value),
    outdatedModules: computed(() => getOutdatedModules(modules.value)),
    setModules,
  };
}

export const useModules = createGlobalState(_useModules);
