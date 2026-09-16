import { useCancelReturnMutation } from "@/modules/returns/api/graphql/mutations/cancelReturn";

export function useCancelReturn() {
  const { mutate, loading } = useCancelReturnMutation();

  async function cancelReturn(returnId: string, reason?: string): Promise<boolean> {
    try {
      const result = await mutate({ command: { returnId, reason: reason || undefined } });

      return result?.data?.cancelReturn?.status === "Cancelled";
    } catch {
      return false;
    }
  }

  return {
    loading,
    cancelReturn,
  };
}
