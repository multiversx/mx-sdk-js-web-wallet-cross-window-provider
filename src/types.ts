import { IPlainTransactionObject } from '@multiversx/sdk-core';

export enum CrossWindowProviderRequestEnums {
  signTransactionsRequest = 'SIGN_TRANSACTIONS_REQUEST',
  signMessageRequest = 'SIGN_MESSAGE_REQUEST',
  loginRequest = 'LOGIN_REQUEST',
  logoutRequest = 'LOGOUT_REQUEST',
  cancelAction = 'CANCEL_ACTION_REQUEST'
}

export enum CrossWindowProviderResponseEnums {
  signTransactionsResponse = 'SIGN_TRANSACTIONS_RESPONSE',
  signMessageResponse = 'SIGN_MESSAGE_RESPONSE',
  loginResponse = 'LOGIN_RESPONSE',
  handshakeResponse = 'HANDSHAKE_RESPONSE',
  cancelResponse = 'CANCEL_RESPONSE',
  disconnectResponse = 'DISCONNECT_RESPONSE',
  noneResponse = 'NONE_RESPONSE'
}

export enum SignMessageStatusEnum {
  pending = 'pending',
  failed = 'failed',
  signed = 'signed',
  cancelled = 'cancelled'
}

export type ReplyWithPostMessageType = {
  type: CrossWindowProviderResponseEnums;
  payload:
    | {
        address: string;
        signature: string;
      }
    | {
        address: string;
      }
    | IPlainTransactionObject;
};
