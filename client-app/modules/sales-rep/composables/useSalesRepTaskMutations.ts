import { useMutation } from "@vue/apollo-composable";
import { computed } from "vue";
import { Logger } from "@/core/utilities";
import {
  ChangeSalesRepTaskStatusDocument,
  CreateSalesRepTaskDocument,
  DeleteSalesRepTaskDocument,
  UpdateSalesRepTaskDocument,
} from "../api/graphql/types";
import type { SalesRepTaskInputType } from "../types/tasks";

/**
 * Task writes. `useMutation` (not useSalesRepHubQuery — that is for reads): a failed user action keeps the global
 * error toast, per the module's convention. Each call returns a boolean rather than throwing, so callers close a
 * dialog on success and leave it open otherwise.
 */
export function useSalesRepTaskMutations() {
  const { mutate: createTask, loading: creating } = useMutation(CreateSalesRepTaskDocument);
  const { mutate: updateTask, loading: updating } = useMutation(UpdateSalesRepTaskDocument);
  const { mutate: changeStatus, loading: changingStatus } = useMutation(ChangeSalesRepTaskStatusDocument);
  const { mutate: deleteTask, loading: deleting } = useMutation(DeleteSalesRepTaskDocument);

  const loading = computed(() => creating.value || updating.value || changingStatus.value || deleting.value);

  async function create(input: SalesRepTaskInputType): Promise<boolean> {
    try {
      await createTask({ command: input });
      return true;
    } catch (error) {
      Logger.error("[sales-rep] createSalesRepTask failed:", error);
      return false;
    }
  }

  async function update(id: string, input: SalesRepTaskInputType): Promise<boolean> {
    try {
      await updateTask({ command: { id, ...input } });
      return true;
    } catch (error) {
      Logger.error("[sales-rep] updateSalesRepTask failed:", error);
      return false;
    }
  }

  async function setCompleted(id: string, completed: boolean): Promise<boolean> {
    try {
      await changeStatus({ command: { id, completed } });
      return true;
    } catch (error) {
      Logger.error("[sales-rep] changeSalesRepTaskStatus failed:", error);
      return false;
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      await deleteTask({ command: { id } });
      return true;
    } catch (error) {
      Logger.error("[sales-rep] deleteSalesRepTask failed:", error);
      return false;
    }
  }

  return { create, update, setCompleted, remove, loading };
}
