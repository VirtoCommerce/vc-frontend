<template>
  <VcLoaderOverlay />
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useAuth } from "@/core/composables/useAuth";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { usePunchoutSession } from "../composables/usePunchoutSession";
import { PUNCHOUT_GRANT_TYPE } from "../constants";

interface IProps {
  sessionToken?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  sessionToken: "",
});

const { authorizeWithGrant } = useAuth();
const { startSession, endSession } = usePunchoutSession();

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
      startSession({
        // The grant issues no refresh token, bearer token lifetime is the session's lifetime.
        expiresAt: Date.now() + response.expires_in * 1000,
      });
    } else {
      endSession();
      Logger.error("punchout/activate", response?.error ?? "The punchout grant returned an incomplete token response");
    }
  } catch (error) {
    endSession();
    Logger.error("punchout/activate", error);
  }

  leave();
});
</script>
