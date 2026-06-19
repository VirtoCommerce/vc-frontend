import { IdentityErrors } from "@/core/enums";

const lockoutErrors = new Set<string>([
  IdentityErrors.USER_IS_LOCKED_OUT,
  IdentityErrors.USER_IS_LOCKED_IN_ORGANIZATION,
]);

export function isLockoutError(errorCode: string | null | undefined): boolean {
  return lockoutErrors.has(errorCode ?? "");
}
