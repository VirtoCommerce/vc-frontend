import { computed, ref } from "vue";
import { useFetch } from "@/core/composables";
import { Logger } from "@/core/utilities";
import type { PasswordOptionsType } from "@/core/types";

const passwordRequirements = ref<PasswordOptionsType>();

export function usePasswordRequirements() {
  const { innerFetch } = useFetch();

  async function fetchPasswordRequirements(): Promise<void> {
    try {
      passwordRequirements.value = await innerFetch<PasswordOptionsType>(
        "/storefrontapi/account/passwordrequirements",
        "GET",
      );
    } catch (e) {
      Logger.error(`${usePasswordRequirements.name}.${fetchPasswordRequirements.name}`, e);
      throw e;
    }
  }

  return {
    passwordRequirements: computed(() => passwordRequirements.value),
    fetchPasswordRequirements,
  };
}
