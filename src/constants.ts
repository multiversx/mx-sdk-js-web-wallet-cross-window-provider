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
    CrossWindowProviderResponseEnums.cancelResponse,
  [CrossWindowProviderRequestEnums.finalizeHandshakeRequest]:
    CrossWindowProviderResponseEnums.noneResponse
};

export const safeWindow = typeof window !== 'undefined' ? window : ({} as any);
