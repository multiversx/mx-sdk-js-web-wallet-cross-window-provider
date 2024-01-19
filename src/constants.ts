import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums,
  ResponseTypeMap
} from './types';

export const responseTypeMap: ResponseTypeMap = {
  [CrossWindowProviderRequestEnums.signTransactionsRequest]:
    CrossWindowProviderResponseEnums.signTransactionsResponse,
  [CrossWindowProviderRequestEnums.signMessageRequest]:
    CrossWindowProviderResponseEnums.signMessageResponse,
  [CrossWindowProviderRequestEnums.loginRequest]:
    CrossWindowProviderResponseEnums.loginResponse,
  [CrossWindowProviderRequestEnums.logoutRequest]:
    CrossWindowProviderResponseEnums.disconnectResponse,
  [CrossWindowProviderRequestEnums.cancelAction]:
    CrossWindowProviderResponseEnums.cancelResponse
};

type SafeWindowType<T extends Window = Window> = {
  [K in keyof T]?: T[K];
};

export const safeWindow: SafeWindowType =
  typeof window !== 'undefined' ? window : ({} as SafeWindowType);
