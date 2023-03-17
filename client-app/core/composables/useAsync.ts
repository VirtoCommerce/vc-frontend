import { readonly, ref } from "vue";
import { Logger } from "../utilities";
import type { IHasLoading } from "./useLoading";

export type AsyncActionType<Payload = void, Result = void> = (payload?: Payload) => Promise<Result>;

export interface IUseAsync<Payload = void, Result = void> extends IHasLoading {
  action: AsyncActionType<Payload, Result>;
}

/**
 * Wrap async action with load tracking
 *
 * @example
 * const cart = ref(null);
 *
 * const { loading: gettingCart, action: getCart } = useAsync(async () => {
 *   cart.value = await $graphqlClient.query<Required<Pick<Query, "cart">>, QueryCartArgs>(...);
 * });
 *
 * const { loading: removingCart, action: removeCart } = useAsync(async () => {
 *   await $graphqlClient.mutate<Required<Pick<Mutations, "removeCart">>, MutationsRemoveCartArgs>(...);
 * });
 *
 * const loading = useLoading(gettingCart, removingCart);
 *
 * return {
 *   loading,
 *   cart,
 *   getCart,
 *   removeCart
 * }
 */
export function useAsync<Payload = void, Result = void>(
  innerAction: AsyncActionType<Payload, Result>
): IUseAsync<Payload, Result> {
  const loading = ref(false);

  async function action(payload?: Payload): Promise<Result> {
    loading.value = true;
    try {
      return await innerAction(payload);
    } catch (e) {
      Logger.error(`${useAsync.name}.${action.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: readonly(loading),
    action,
  };
}
