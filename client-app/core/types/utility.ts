import type { DeepPartial, DeepRequired } from "utility-types";

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/ban-types */
type _DeepOmitByType<T, U extends DeepPartial<T>> =
  T extends Array<infer E>
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

export type CamelToSnake<T extends string> = T extends `${infer First}${infer Rest}`
  ? `${First extends Uppercase<First> ? "_" : ""}${Lowercase<First>}${CamelToSnake<Rest>}`
  : T;
