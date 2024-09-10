<script setup lang="ts">
import { useMergeCartMutation } from "@/core/api/graphql";
import { useAuth } from "@/core/composables/useAuth";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account";
import { TabsType, openReturnUrl, useBroadcast } from "@/shared/broadcast";
import { useShortCart } from "@/shared/cart";

const broadcast = useBroadcast();
const { externalSignInCallback } = useAuth();
const { cart } = useShortCart();
const { mutate: mergeCart } = useMergeCartMutation();
const { user } = useUser();

async function externalSignIn(): Promise<void> {
  try {
    await externalSignInCallback();
    if (cart.value?.id) {
      await mergeCart({ command: { userId: user.value.id, secondCartId: cart.value.id } });
    }
    broadcast.emit(openReturnUrl, undefined, TabsType.ALL);
  } catch (e) {
    Logger.error(externalSignIn.name, e);
  }
}

await externalSignIn();
</script>
