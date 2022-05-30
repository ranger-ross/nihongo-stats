import {CSSProperties} from "react";

export type OverwriteType<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type AppStyles = {[key: string]: CSSProperties};
