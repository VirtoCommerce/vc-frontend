import { useCancelReturnMutation } from "@/modules/returns/api/graphql/mutations/cancelReturn";

export function useCancelReturn() {
  const { mutate, loading } = useCancelReturnMutation();

  async function cancelReturn(returnId: string, reason?: string): Promise<boolean> {
    try {
      const result = await mutate({ command: { returnId, reason: reason || undefined } });

      return result?.data?.cancelReturn?.status === "Cancelled";
    } catch {
      // WRONG_STATUS arrives here when an agent moved the return on while the buyer was deciding.
      // The global error link has already shown what happened, so the caller only needs to know
      // the return is still open and keep the page as it is.
      return false;
    }
  }

  return {
    loading,
    cancelReturn,
  };
}
