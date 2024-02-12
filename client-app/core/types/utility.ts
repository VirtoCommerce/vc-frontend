/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/ban-types */
type _DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer E>
    ? Array<_DeepPartial<E>>
    : T extends object
      ? DeepPartial<T>
      : T | undefined;

export type DeepPartial<T> = { [K in keyof T]?: _DeepPartial<T[K]> };

type _DeepRequired<T> = T extends Function
  ? T
  : T extends Array<infer E>
    ? Array<DeepRequired<E>>
    : T extends object
      ? DeepRequired<T>
      : T | undefined;

export type DeepRequired<T> = { [K in keyof T]-?: _DeepRequired<T[K]> };

type _DeepOmitByType<T, U extends DeepPartial<T>> = T extends Function
  ? U extends Function
    ? T
    : never
  : T extends Array<infer E>
    ? U extends Array<infer UE>
      ? UE extends DeepPartial<E>
        ? Array<_DeepOmitByType<E, UE>>
        : E
      : never
    : T extends object
      ? U extends object
        ? DeepOmitByType<T, U>
        : never
      : T | undefined;

export type DeepOmitByType<T, U extends DeepPartial<T>> = {
  [K in keyof T as U[K] extends DeepRequired<T[K]> ? never : K]: U[K] extends DeepPartial<T[K]>
    ? _DeepOmitByType<T[K], U[K]>
    : T[K];
};
