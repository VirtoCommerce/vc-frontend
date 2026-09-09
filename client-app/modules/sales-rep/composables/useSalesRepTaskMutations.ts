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

async function run(operation: string, mutate: () => Promise<unknown>): Promise<boolean> {
  try {
    await mutate();
    return true;
  } catch (error) {
    Logger.error(`[sales-rep] ${operation} failed:`, error);
    return false;
  }
}

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

  function create(input: SalesRepTaskInputType): Promise<boolean> {
    return run("createSalesRepTask", () => createTask({ command: input }));
  }

  function update(id: string, input: SalesRepTaskInputType): Promise<boolean> {
    // updateSalesRepTask REPLACES the task: description, type and priority are non-null, so an omitted one is a
    // schema error rather than "leave it alone". Spread out the optionals explicitly - "" clears a field, and an
    // empty priority means Normal. The shared input type stays optional-shaped because create still accepts that.
    return run("updateSalesRepTask", () =>
      updateTask({
        command: {
          id,
          name: input.name,
          dueDate: input.dueDate,
          description: input.description ?? "",
          type: input.type ?? "",
          priority: input.priority ?? "",
        },
      }),
    );
  }

  function setCompleted(id: string, completed: boolean): Promise<boolean> {
    return run("changeSalesRepTaskStatus", () => changeStatus({ command: { id, completed } }));
  }

  function remove(id: string): Promise<boolean> {
    return run("deleteSalesRepTask", () => deleteTask({ command: { id } }));
  }

  return { create, update, setCompleted, remove, loading };
}
