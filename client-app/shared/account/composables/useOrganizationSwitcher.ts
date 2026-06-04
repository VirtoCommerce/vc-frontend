import { ref } from "vue";
import { useAuth, useErrorsTranslator } from "@/core/composables";
import { IdentityErrors } from "@/core/enums";
import { useUser } from "@/shared/account";
import type { IdentityErrorType } from "@/core/api/graphql/types";

export function useOrganizationSwitcher() {
  const { switchOrganization } = useUser();
  const { errors: authErrors } = useAuth();
  const { translate } = useErrorsTranslator<IdentityErrorType>("shared.account.sign_in_form.errors");

  const switchError = ref<string | null>(null);

  async function trySwitch(organizationId: string): Promise<boolean> {
    switchError.value = null;
    const succeeded = await switchOrganization(organizationId);

    if (!succeeded && authErrors.value?.length) {
      const lockedError = authErrors.value.find(
        (e) => e.code === IdentityErrors.USER_IS_LOCKED_IN_ORGANIZATION || e.code === IdentityErrors.USER_IS_LOCKED_OUT,
      );
      switchError.value = (lockedError ? translate(lockedError) : translate(authErrors.value[0])) ?? null;
    }

    return succeeded;
  }

  return { switchError, trySwitch };
}
