<template>
  <VcLoaderOverlay />
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { Logger } from "@/core/utilities";
import { activatePunchoutSession } from "../api/graphql/mutations/activatePunchoutSession";
import { usePunchoutSession } from "../composables/usePunchoutSession";

interface IProps {
  sessionToken?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  sessionToken: "",
});

const router = useRouter();
const { startSession, endSession } = usePunchoutSession();

onMounted(async () => {
  try {
    const result = await activatePunchoutSession(props.sessionToken);

    if (result && !result.error) {
      startSession({
        punchoutCartId: result.punchoutCartId ?? "",
        punchoutCartName: result.punchoutCartName ?? "",
      });
    } else {
      endSession();
      Logger.error("punchout/activatePunchoutSession", result?.error ?? "No activation result");
    }
  } catch (e) {
    endSession();
    Logger.error("punchout/activatePunchoutSession", e);
  }

  await router.replace({ path: "/" });
});
</script>
