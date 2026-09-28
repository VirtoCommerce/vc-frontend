import { globals } from "@/core/globals";
import { useCancelReturnMutation } from "@/modules/returns/api/graphql/mutations/cancelReturn";
import { useReturnErrors } from "@/modules/returns/composables/useReturnErrors";

export function useCancelReturn() {
  const { mutate, loading } = useCancelReturnMutation();
  const { report } = useReturnErrors();

  async function cancelReturn(returnId: string, reason?: string): Promise<boolean> {
    try {
      const result = await mutate({
        command: { returnId, reason: reason || undefined },
        cultureName: globals.cultureName,
      });

      return result?.data?.cancelReturn?.status === "Cancelled";
    } catch (error) {
      report(error);

      return false;
    }
  }

  return {
    loading,
    cancelReturn,
  };
}
