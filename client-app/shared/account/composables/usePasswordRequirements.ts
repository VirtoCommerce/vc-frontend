import { useFetch } from "@/core/api/common";
import type { PasswordOptionsType } from "@/core/types";

export function usePasswordRequirements() {
  const { data: passwordRequirements, execute: fetchPasswordRequirements } = useFetch(
    "/storefrontapi/account/passwordrequirements",
    { immediate: false },
  )
    .get()
    .json<PasswordOptionsType>();

  return {
    passwordRequirements,
    fetchPasswordRequirements,
  };
}
