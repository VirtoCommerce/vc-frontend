import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  useDeleteSignInKeyMutation,
  useGetSignInMethodsQuery,
  useRenameSignInKeyMutation,
} from "@/core/api/graphql/account";
import { useErrorsTranslator } from "@/core/composables";
import { Logger } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import type { IdentityErrorType } from "@/core/api/graphql/types";

export function useSignInMethods() {
  const { t } = useI18n();
  const notifications = useNotifications();
  const { translate } = useErrorsTranslator<IdentityErrorType>("identity_error");

  const { result, loading, refetch } = useGetSignInMethodsQuery();
  const { mutate: renameMutation, loading: renaming } = useRenameSignInKeyMutation();
  const { mutate: deleteMutation, loading: deleting } = useDeleteSignInKeyMutation();

  const signInMethods = computed(() => result.value?.signInMethods ?? []);

  async function renameKey(signInMethodName: string, keyId: string, name: string): Promise<boolean> {
    try {
      const identityResult = (await renameMutation({ command: { signInMethodName, keyId, name } }))?.data
        ?.renameSignInKey;

      if (!identityResult?.succeeded) {
        showError(identityResult);

        return false;
      }

      return true;
    } catch (e) {
      Logger.error(`${useSignInMethods.name}.${renameKey.name}`, e);

      return false;
    }
  }

  async function deleteKey(signInMethodName: string, keyId: string): Promise<boolean> {
    try {
      const identityResult = (await deleteMutation({ command: { signInMethodName, keyId } }))?.data?.deleteSignInKey;

      if (!identityResult?.succeeded) {
        showError(identityResult);

        return false;
      }

      return true;
    } catch (e) {
      Logger.error(`${useSignInMethods.name}.${deleteKey.name}`, e);

      return false;
    }
  }

  function showError(identityResult?: { errors?: IdentityErrorType[] }): void {
    const error = identityResult?.errors?.[0];

    notifications.error({
      text: (error && translate(error)) || t("common.messages.something_went_wrong"),
    });
  }

  return {
    signInMethods,
    loading,
    renaming,
    deleting,
    refetch,
    renameKey,
    deleteKey,
  };
}
