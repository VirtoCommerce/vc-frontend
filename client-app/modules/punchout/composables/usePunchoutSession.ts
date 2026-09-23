import { createGlobalState, useLocalStorage } from "@vueuse/core";
import { computed, readonly } from "vue";
import { PUNCHOUT_SESSION_STORAGE_KEY } from "../constants";
import type { PunchoutSessionType } from "../types";

const INITIAL_STATE: PunchoutSessionType = Object.freeze({
  isActive: false,
  punchoutCartName: "",
  punchoutCartId: "",
});

function _usePunchoutSession() {
  const session = useLocalStorage<PunchoutSessionType>(
    PUNCHOUT_SESSION_STORAGE_KEY,
    { ...INITIAL_STATE },
    { mergeDefaults: true },
  );

  function startSession(payload: Omit<PunchoutSessionType, "isActive">) {
    session.value = {
      isActive: true,
      punchoutCartName: payload.punchoutCartName,
      punchoutCartId: payload.punchoutCartId,
    };
  }

  function endSession() {
    session.value = { ...INITIAL_STATE };
  }

  return {
    isPunchoutMode: computed(() => session.value.isActive),
    punchoutCartId: computed(() => session.value.punchoutCartId),
    punchoutCartName: computed(() => session.value.punchoutCartName),
    session: readonly(session),
    startSession,
    endSession,
  };
}

export const usePunchoutSession = createGlobalState(_usePunchoutSession);
