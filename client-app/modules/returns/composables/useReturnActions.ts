import { computed, toValue } from "vue";
import { RETURN_ACTION } from "@/modules/returns/constants";
import type { MaybeRefOrGetter } from "vue";

// Structural rather than the generated type: every query asking for availableActions produces its
// own inline type for it.
type ReturnActionLikeType = {
  name: string;
  isAvailable: boolean;
  unavailableReason?: string;
};

type ReturnWithActionsType = {
  availableActions: ReturnActionLikeType[];
};

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
