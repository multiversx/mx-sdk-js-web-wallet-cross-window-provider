import { IPlainTransactionObject } from '@multiversx/sdk-core';

export enum CrossWindowProviderRequestEnums {
  signTransactionsRequest = 'SIGN_TRANSACTIONS_REQUEST',
  signMessageRequest = 'SIGN_MESSAGE_REQUEST',
  loginRequest = 'LOGIN_REQUEST',
  logoutRequest = 'LOGOUT_REQUEST',
  cancelAction = 'CANCEL_ACTION_REQUEST'
}

export enum CrossWindowProviderResponseEnums {
  handshakeResponse = 'HANDSHAKE_RESPONSE',
  loginResponse = 'LOGIN_RESPONSE',
  disconnectResponse = 'DISCONNECT_RESPONSE',
  cancelResponse = 'CANCEL_RESPONSE',
  signTransactionsResponse = 'SIGN_TRANSACTIONS_RESPONSE',
  signMessageResponse = 'SIGN_MESSAGE_RESPONSE',
  noneResponse = 'NONE_RESPONSE'
}

export enum SignMessageStatusEnum { // TODO: consume in sdk-dapp
  pending = 'pending',
  failed = 'failed',
  signed = 'signed',
  cancelled = 'cancelled'
}

type ReplyWithPostMessageObjectType = {
  [CrossWindowProviderResponseEnums.handshakeResponse]: {
    data?: boolean;
    error?: string;
  };
  [CrossWindowProviderResponseEnums.loginResponse]: {
    data?: {
      address: string;
      accessToken?: string;
      name?: string;
      signature?: string;
    };
    error?: string;
  };
  [CrossWindowProviderResponseEnums.disconnectResponse]: null;
  [CrossWindowProviderResponseEnums.cancelResponse]: {
    data?: {
      address: string;
    };
    error?: string;
  };
  [CrossWindowProviderResponseEnums.signTransactionsResponse]: {
    data?: IPlainTransactionObject[];
    error?: string;
  };
  [CrossWindowProviderResponseEnums.signMessageResponse]: {
    data?: {
      signature?: string;
      status: SignMessageStatusEnum;
    };
    error?: string;
  };
  [CrossWindowProviderResponseEnums.noneResponse]: null;
};

export type ReplyWithPostMessageType<
  T extends CrossWindowProviderResponseEnums
> = {
  type: T;
  payload: ReplyWithPostMessageObjectType[T];
};

export type ResponseTypeMap = {
  [CrossWindowProviderRequestEnums.signTransactionsRequest]: CrossWindowProviderResponseEnums.signTransactionsResponse;
  [CrossWindowProviderRequestEnums.signMessageRequest]: CrossWindowProviderResponseEnums.signMessageResponse;
  [CrossWindowProviderRequestEnums.loginRequest]: CrossWindowProviderResponseEnums.loginResponse;
  [CrossWindowProviderRequestEnums.logoutRequest]: CrossWindowProviderResponseEnums.disconnectResponse;
  [CrossWindowProviderRequestEnums.cancelAction]: CrossWindowProviderResponseEnums.cancelResponse;
};
