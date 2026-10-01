<template>
  <VcLoaderOverlay />
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useAuth } from "@/core/composables/useAuth";
import { USER_ID_LOCAL_STORAGE } from "@/core/constants";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { TabsType, reloadAndOpenMainPage, useBroadcast } from "@/shared/broadcast";
import { usePunchoutSession } from "../composables/usePunchoutSession";
import { PUNCHOUT_GRANT_TYPE } from "../constants";

interface IProps {
  sessionToken?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  sessionToken: "",
});

const { authorizeWithGrant } = useAuth();
const { startSession } = usePunchoutSession();
const broadcast = useBroadcast();

function leave() {
  location.href = "/";
}

onMounted(async () => {
  try {
    const response = await authorizeWithGrant(
      new URLSearchParams({
        grant_type: PUNCHOUT_GRANT_TYPE,
        session_token: props.sessionToken,
        storeId: globals.storeId,
      }),
    );

    if (response?.access_token && response.token_type && response.expires_in) {
      localStorage.removeItem(USER_ID_LOCAL_STORAGE);

      startSession({
        // The grant issues no refresh token, bearer token lifetime is the session's lifetime.
        expiresAt: Date.now() + response.expires_in * 1000,
      });

      // Tokens are already persisted, so other tabs read the new session on reload.
      void broadcast.emit(reloadAndOpenMainPage, null, TabsType.OTHERS);
    } else {
      // A failed grant keeps the current tokens/active punchout session
      Logger.error("punchout/activate", response?.error ?? "The punchout grant returned an incomplete token response");
    }
  } catch (error) {
    Logger.error("punchout/activate", error);
  }

  leave();
});
</script>
