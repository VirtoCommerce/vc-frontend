/**
 * Returns object T, but with the combined type R
 * @example
 *  type OriginalType = { a: string; b: boolean; c: number; }
 *  type ModifiedType = Modify<OriginalType , { a: number; b: number; }>
 *  // ModifiedType = { a: number; b: number; c: number; }
 */
export type ModifyType<T, R> = Omit<T, keyof R> & R;
