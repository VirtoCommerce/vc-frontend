import { createGlobalState, useLocalStorage } from "@vueuse/core";
import { computed, readonly } from "vue";
import { PUNCHOUT_SESSION_STORAGE_KEY } from "../constants";
import type { PunchoutSessionType } from "../types";

const INITIAL_STATE: PunchoutSessionType = Object.freeze({
  isActive: false,
  expiresAt: 0,
});

function _usePunchoutSession() {
  const session = useLocalStorage<PunchoutSessionType>(
    PUNCHOUT_SESSION_STORAGE_KEY,
    { ...INITIAL_STATE },
    { mergeDefaults: true },
  );

  function startSession(payload: Pick<PunchoutSessionType, "expiresAt">) {
    session.value = {
      ...INITIAL_STATE,
      isActive: true,
      expiresAt: payload.expiresAt,
    };
  }

  function endSession() {
    session.value = { ...INITIAL_STATE };
  }

  return {
    isPunchoutMode: computed(() => session.value.isActive),
    expiresAt: computed(() => session.value.expiresAt),
    session: readonly(session),
    startSession,
    endSession,
  };
}

export const usePunchoutSession = createGlobalState(_usePunchoutSession);
