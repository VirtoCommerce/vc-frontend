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

  const installedModuleIds = computed<ReadonlySet<string>>(() => {
    const ids = new Set<string>();
    for (const module of modules.value) {
      if (module.moduleId) {
        ids.add(module.moduleId);
      }
    }
    return ids;
  });

  return {
    modules: computed(() => modules.value),
    outdatedModules: computed(() => getOutdatedModules(modules.value)),
    installedModuleIds,
    hasModule: (moduleId: string) => installedModuleIds.value.has(moduleId),
    setModules,
  };
}

export const useModules = createGlobalState(_useModules);
