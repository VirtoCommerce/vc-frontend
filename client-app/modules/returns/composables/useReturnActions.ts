import { computed, toValue } from "vue";
import { RETURN_ACTION } from "@/modules/returns/constants";
import type { MaybeRefOrGetter } from "vue";

/**
 * Structural rather than the generated type: the shape is what matters, and every query that asks
 * for availableActions produces its own inline type for it.
 */
type ReturnActionLikeType = {
  name: string;
  isAvailable: boolean;
  unavailableReason?: string;
};

type ReturnWithActionsType = {
  availableActions: ReturnActionLikeType[];
};

/**
 * What the buyer may do with a return, as the server decides it.
 *
 * The transition table lives in the module's IReturnStateProvider; asking the server keeps the
 * storefront from carrying a second copy of it that quietly drifts.
 */
export function useReturnActions(orderReturn: MaybeRefOrGetter<ReturnWithActionsType | undefined>) {
  const actions = computed(() => toValue(orderReturn)?.availableActions ?? []);

  function find(name: string) {
    return actions.value.find((action) => action.name === name);
  }

  return {
    actions,
    find,
    canEdit: computed(() => !!find(RETURN_ACTION.EDIT)?.isAvailable),
    canSubmit: computed(() => !!find(RETURN_ACTION.SUBMIT)?.isAvailable),
    cancelAction: computed(() => find(RETURN_ACTION.CANCEL)),
  };
}
