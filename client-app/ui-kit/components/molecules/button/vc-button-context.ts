import { computed, inject, provide, toValue } from "vue";
import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from "vue";

export const vcButtonContextKey: InjectionKey<ComputedRef<VcButtonContextType>> = Symbol("vc-button-context");

export function injectButtonContext(): ComputedRef<VcButtonContextType> | null {
  return inject(vcButtonContextKey, null);
}

/** Passes a container's values to the buttons inside it; a value left undefined keeps the outer container's one. */
export function provideButtonContext(source: MaybeRefOrGetter<VcButtonContextType>): void {
  const parent = injectButtonContext();

  const context = computed<VcButtonContextType>(() => {
    const own = toValue(source);
    const inherited = parent?.value;

    return {
      size: own.size ?? inherited?.size,
      color: own.color ?? inherited?.color,
      variant: own.variant ?? inherited?.variant,
    };
  });

  provide(vcButtonContextKey, context);
}
