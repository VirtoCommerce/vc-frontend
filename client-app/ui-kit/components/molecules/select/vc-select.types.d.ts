declare global {
  /**
   * What the component emits, narrowed by the `multiple` flag: an array in multiple mode,
   * a single value otherwise. `undefined` stays part of the single-mode shape because
   * clearing emits it, so a consumer's handler has to accept it. What `M` buys is keeping
   * the array out of single-mode handlers, not keeping `undefined` out.
   */
  type VcSelectEmittedType<V, M extends boolean> = M extends true ? V[] : V | undefined;

  /** Property name, or an accessor function, resolving a field of an option. */
  type VcSelectFieldAccessorType<T, R> = string | ((item: T) => R);
}

export {};
