<script setup lang="ts">
import { useAuth } from "@/core/composables/useAuth";
import { Logger } from "@/core/utilities";
import { useSignMeIn } from "@/shared/account";
const { signIn } = useSignMeIn();

const { externalSignInCallback } = useAuth();

async function externalSignIn(): Promise<void> {
  try {
    await externalSignInCallback();
    await signIn();
  } catch (e) {
    Logger.error(externalSignIn.name, e);
  }
}

await externalSignIn();
</script>
