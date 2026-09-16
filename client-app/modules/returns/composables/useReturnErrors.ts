import { useI18n } from "vue-i18n";
import { useNotifications } from "@/shared/notification";
import type { ReturnErrorDetailsType } from "@/modules/returns/types";
import type { ApolloError } from "@apollo/client/core";

const FALLBACK = "UNHANDLED";

export function useReturnErrors() {
  const { t, te } = useI18n();
  const notifications = useNotifications();

  // The flow service ships the line and the number it could actually allow, and that is exactly
  // what a buyer needs to fix the draft. Reading only the code throws it away.
  function getDetails(error: unknown): ReturnErrorDetailsType {
    const extensions = (error as ApolloError | undefined)?.graphQLErrors?.[0]?.extensions ?? {};

    return {
      orderLineItemId: typeof extensions.orderLineItemId === "string" ? extensions.orderLineItemId : undefined,
      availableQuantity: typeof extensions.availableQuantity === "number" ? extensions.availableQuantity : undefined,
    };
  }

  function getCode(error: unknown): string {
    const graphQLErrors = (error as ApolloError | undefined)?.graphQLErrors;
    const code = graphQLErrors?.[0]?.extensions?.code;

    return typeof code === "string" && te(`returns.errors.${code}`) ? code : FALLBACK;
  }

  // The catalogues these codes come from live in the module repo, so a server upgrade can send one
  // the storefront has never heard of. Printing the key itself is worse than saying nothing useful.
  function codeText(namespace: string, code?: string | null): string {
    const key = code ? `returns.${namespace}.${code}` : "";

    return t(te(key) ? key : `returns.${namespace}.${FALLBACK}`);
  }

  // The flow service fails with codes a buyer can act on — a line that lost its availability while
  // the draft sat open, a missing photo. Swallowing them leaves a dead button and no explanation.
  // single: true would clear every notification on screen, not just ours.
  function report(error: unknown): void {
    notifications.error({ text: t(`returns.errors.${getCode(error)}`), duration: 15000 });
  }

  return { getCode, getDetails, codeText, report };
}
