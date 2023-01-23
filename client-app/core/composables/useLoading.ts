import { isRef, readonly, Ref, ref, watchEffect } from "vue";
import { Logger } from "@/core";
import { MaybeRef } from "@vueuse/core";

export type Load<Payload = void, Result = void> = (payload?: Payload) => Promise<Result>;

export interface UseLoad<Payload = void, Result = void> {
  load: Load<Payload, Result>;
}

export interface UseLoading<Payload = void, Result = void> extends UseLoad<Payload, Result> {
  loading: Readonly<Ref<boolean>>;
}

export function useLoading<Param, Payload = void, Result = void>(
  param: MaybeRef<Param>,
  innerLoad: Load<Payload, Result>
): UseLoading<Payload, Result> {
  const loading = ref(false);

  async function load(payload?: Payload): Promise<Result> {
    loading.value = true;

    try {
      return await innerLoad(payload);
    } catch (e) {
      Logger.error(`${useLoading.name}.${load.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  if (isRef(param)) {
    watchEffect(() => load());
  } else {
    load();
  }

  return {
    loading: readonly(loading),
    load,
  };
}
