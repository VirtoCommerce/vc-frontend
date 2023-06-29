import { useUser } from "@/shared/account";
import { pageReloadEvent, useBroadcast, userReloadEvent } from "@/shared/broadcast";

let installed = false;

export function setupBroadcastGlobalListeners() {
  if (installed) {
    throw new Error(`The "${setupBroadcastGlobalListeners.name}" function must be called once.`);
  }

  installed = true;

  const { on } = useBroadcast();
  const { fetchUser } = useUser();

  on(pageReloadEvent, () => location.reload());
  on(userReloadEvent, () => fetchUser());
}
