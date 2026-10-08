declare global {
  /** Emitted value: an array in multiple mode, otherwise a value or `undefined` (cleared). */
  type VcSelectEmittedType<V, M extends boolean> = M extends true ? V[] : V | undefined;

  /** Property name, or an accessor function, resolving a field of an option. */
  type VcSelectFieldAccessorType<T, R> = Extract<keyof T, string> | ((item: T) => R);

  /**
   * The key form of `value-field`: with a model bound, only a key whose value fits the model's type
   * (a `number` model cannot take a `string` id). Without one the model defaults to the item, so
   * any key — as for a model whose type is itself an item. A field typed `unknown` fits any model.
   */
  type VcSelectValueKeyType<T, V> = [V] extends [T]
    ? Extract<keyof T, string>
    : Extract<
        { [K in keyof T]-?: unknown extends T[K] ? K : NonNullable<T[K]> extends V ? K : never }[keyof T],
        string
      >;
}

export {};
