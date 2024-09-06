import {
  WindowProviderRequestEnums,
  WindowProviderResponseEnums
} from '../enums';
import { ResponseTypeMap } from '../types';

export const responseTypeMap: ResponseTypeMap = {
  [WindowProviderRequestEnums.signTransactionsRequest]:
    WindowProviderResponseEnums.signTransactionsResponse,
  [WindowProviderRequestEnums.guardTransactionsRequest]:
    WindowProviderResponseEnums.guardTransactionsResponse,
  [WindowProviderRequestEnums.signMessageRequest]:
    WindowProviderResponseEnums.signMessageResponse,
  [WindowProviderRequestEnums.loginRequest]:
    WindowProviderResponseEnums.loginResponse,
  [WindowProviderRequestEnums.logoutRequest]:
    WindowProviderResponseEnums.disconnectResponse,
  [WindowProviderRequestEnums.cancelAction]:
    WindowProviderResponseEnums.cancelResponse,
  [WindowProviderRequestEnums.finalizeHandshakeRequest]:
    WindowProviderResponseEnums.noneResponse,
  [WindowProviderRequestEnums.finalizeResetStateRequest]:
    WindowProviderResponseEnums.resetStateResponse
};
