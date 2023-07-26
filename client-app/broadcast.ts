import { useRouter } from "vue-router";
import { usePagesWithFullCartLoad } from "@/core/composables";
import { getReturnUrlValue } from "@/core/utilities";
import { useUser } from "@/shared/account";
import {
  cartReloadEvent,
  pageReloadEvent,
  userReloadEvent,
  unauthorizedErrorEvent,
  useBroadcast,
  openReturnUrl,
} from "@/shared/broadcast";
import { useCart } from "@/shared/cart";

let installed = false;

export function setupBroadcastGlobalListeners() {
  if (installed) {
    throw new Error(`The "${setupBroadcastGlobalListeners.name}" function must be called once.`);
  }

  installed = true;

  const router = useRouter();
  const { on } = useBroadcast();
  const { fetchUser, isPasswordNeedToBeChanged } = useUser();
  const { pagesWithFullCartLoad } = usePagesWithFullCartLoad();
  const { fetchShortCart, fetchFullCart } = useCart();

  on(pageReloadEvent, () => location.reload());
  on(userReloadEvent, () => fetchUser());
  on(cartReloadEvent, async () => {
    const route = router.currentRoute.value;

    if (route.matched.some((item) => item.name === "Checkout")) {
      await router.replace({ name: "Cart" });
    } else if (pagesWithFullCartLoad.has(route.name!)) {
      await fetchFullCart();
    } else {
      await fetchShortCart();
    }
  });
  on(unauthorizedErrorEvent, async () => {
    await fetchUser();
    if (!isPasswordNeedToBeChanged.value) {
      const { hash, pathname, search } = location;

      if (pathname !== "/sign-in") {
        location.href = `/sign-in?returnUrl=${pathname + search + hash}`;
      }
    }
  });
  on(openReturnUrl, () => {
    location.href = getReturnUrlValue() || "/";
  });
}
