import { ResponseTypeMap } from './types';
export declare const responseTypeMap: ResponseTypeMap;
type SafeWindowType<T extends Window = Window> = {
    [K in keyof T]?: T[K];
};
export declare const safeWindow: SafeWindowType;
export {};
