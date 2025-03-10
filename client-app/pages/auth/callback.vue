<script setup lang="ts">
import { useAnalytics, useAuth } from "@/core/composables";
import { Logger } from "@/core/utilities";
import { useSignMeIn } from "@/shared/account";

const { signIn, errors } = useSignMeIn();
const { externalSignInCallback } = useAuth();
const { analytics } = useAnalytics();

async function externalSignIn(): Promise<void> {
  try {
    await externalSignInCallback();
    await signIn();
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    Logger.error(externalSignIn.name, e);
    analytics("login", "external", {
      success: false,
      errors: error?.message,
    });
  }

  if (errors.value?.length) {
    analytics("login", "external", {
      success: false,
      errors: errors.value.map((error) => `${error.code}: ${error.description}`).join(", "),
    });
  }

  analytics("login", "external", { success: true });
}

await externalSignIn();
</script>
