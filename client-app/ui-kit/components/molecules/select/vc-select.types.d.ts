declare global {
  /** Emitted value: an array in multiple mode, otherwise a value or `undefined` (cleared). */
  type VcSelectEmittedType<V, M extends boolean> = M extends true ? V[] : V | undefined;

  /** Property name, or an accessor function, resolving a field of an option. */
  type VcSelectFieldAccessorType<T, R> = Extract<keyof T, string> | ((item: T) => R);

  /**
   * `value-field`: with a model bound, only a key whose value fits the model's type (a `number`
   * model cannot take a `string` id). Without one the model defaults to the item, so any key.
   */
  type VcSelectValueFieldType<T, V> = [V] extends [T]
    ? VcSelectFieldAccessorType<T, V>
    : Extract<{ [K in keyof T]-?: NonNullable<T[K]> extends V ? K : never }[keyof T], string> | ((item: T) => V);
}

export {};
