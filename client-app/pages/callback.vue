<script setup lang="ts">
import { useAuth } from "@/core/composables/useAuth";
import { Logger } from "@/core/utilities";
import { TabsType, openReturnUrl, useBroadcast } from "@/shared/broadcast";

const broadcast = useBroadcast();
const { externalSignInCallback } = useAuth();

async function externalSignIn(): Promise<void> {
  try {
    await externalSignInCallback();
    broadcast.emit(openReturnUrl, undefined, TabsType.ALL);
  } catch (e) {
    Logger.error(externalSignIn.name, e);
  }
}

await externalSignIn();
</script>
