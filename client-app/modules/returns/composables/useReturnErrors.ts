import { useI18n } from "vue-i18n";
import { useNotifications } from "@/shared/notification";
import type { ApolloError } from "@apollo/client/core";

const FALLBACK = "UNHANDLED";

export function useReturnErrors() {
  const { t, te } = useI18n();
  const notifications = useNotifications();

  function getCode(error: unknown): string {
    const graphQLErrors = (error as ApolloError | undefined)?.graphQLErrors;
    const code = graphQLErrors?.[0]?.extensions?.code;

    return typeof code === "string" && te(`returns.errors.${code}`) ? code : FALLBACK;
  }

  // The flow service fails with codes a buyer can act on — a line that lost its availability while
  // the draft sat open, a missing photo. Swallowing them leaves a dead button and no explanation.
  function report(error: unknown): void {
    notifications.error({ text: t(`returns.errors.${getCode(error)}`), duration: 15000, single: true });
  }

  return { getCode, report };
}
