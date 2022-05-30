export type OverwriteType<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
