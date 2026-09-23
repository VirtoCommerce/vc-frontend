import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { ActivatePunchoutSessionDocument } from "../../types";
import type { Mutations, MutationsActivatePunchoutSessionArgs, PunchoutSessonActivationResultType } from "../../types";

export async function activatePunchoutSession(
  sessionToken: string,
): Promise<PunchoutSessonActivationResultType | undefined> {
  const { storeId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "activatePunchoutSession">>,
    MutationsActivatePunchoutSessionArgs
  >({
    mutation: ActivatePunchoutSessionDocument,
    variables: {
      command: {
        storeId,
        sessionToken,
        cultureName,
        currencyCode,
      },
    },
  });

  return data?.activatePunchoutSession;
}
