import type {
  IPlainTransactionObject,
  SignableMessage
} from '@multiversx/sdk-core';

export enum CrossWindowProviderRequestEnums {
  signTransactionsRequest = 'SIGN_TRANSACTIONS_REQUEST',
  signMessageRequest = 'SIGN_MESSAGE_REQUEST',
  loginRequest = 'LOGIN_REQUEST',
  logoutRequest = 'LOGOUT_REQUEST',
  cancelAction = 'CANCEL_ACTION_REQUEST',
  finalizeHandshakeRequest = 'FINALIZE_HANDSHAKE_REQUEST'
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

export type ReplyWithPostMessageObjectType = {
  [CrossWindowProviderResponseEnums.handshakeResponse]: boolean;
  [CrossWindowProviderResponseEnums.loginResponse]: {
    address: string;
    accessToken?: string;
    /**
     * used in De-Fi wallet extension as wallet name
     * */
    name?: string;
    signature?: string;
  };
  [CrossWindowProviderResponseEnums.disconnectResponse]: boolean;
  [CrossWindowProviderResponseEnums.cancelResponse]: {
    address: string;
  };
  [CrossWindowProviderResponseEnums.signTransactionsResponse]: IPlainTransactionObject[];
  [CrossWindowProviderResponseEnums.signMessageResponse]: {
    signature?: string;
    status: SignMessageStatusEnum;
  };
  [CrossWindowProviderResponseEnums.noneResponse]: null;
};

type ReplyWithPostMessagePayloadType<
  T extends ReplyWithPostMessageObjectType[keyof ReplyWithPostMessageObjectType]
> = {
  data?: T;
  error?: string;
};

export type ReplyWithPostMessageType<
  T extends CrossWindowProviderResponseEnums
> = {
  type: T;
  payload: ReplyWithPostMessagePayloadType<ReplyWithPostMessageObjectType[T]>;
};

export type ResponseTypeMap = {
  [CrossWindowProviderRequestEnums.signTransactionsRequest]: CrossWindowProviderResponseEnums.signTransactionsResponse;
  [CrossWindowProviderRequestEnums.signMessageRequest]: CrossWindowProviderResponseEnums.signMessageResponse;
  [CrossWindowProviderRequestEnums.loginRequest]: CrossWindowProviderResponseEnums.loginResponse;
  [CrossWindowProviderRequestEnums.logoutRequest]: CrossWindowProviderResponseEnums.disconnectResponse;
  [CrossWindowProviderRequestEnums.cancelAction]: CrossWindowProviderResponseEnums.cancelResponse;
  [CrossWindowProviderRequestEnums.finalizeHandshakeRequest]: CrossWindowProviderResponseEnums.noneResponse;
};

export type RequestPayloadType = {
  [CrossWindowProviderRequestEnums.loginRequest]: undefined;
  [CrossWindowProviderRequestEnums.logoutRequest]: undefined;
  [CrossWindowProviderRequestEnums.signTransactionsRequest]: IPlainTransactionObject[];
  [CrossWindowProviderRequestEnums.signMessageRequest]: SignableMessage;
  [CrossWindowProviderRequestEnums.cancelAction]: undefined;
  [CrossWindowProviderRequestEnums.finalizeHandshakeRequest]: undefined;
};

export type RequestMessageType = {
  [K in keyof RequestPayloadType]: {
    type: RequestPayloadType;
    payload: RequestPayloadType[K];
  };
}[keyof RequestPayloadType];

export type ReplyWithPostMessageEventType = {
  [K in keyof ReplyWithPostMessageObjectType]: {
    type: CrossWindowProviderResponseEnums;
    payload: ReplyWithPostMessageObjectType[K];
  };
}[keyof ReplyWithPostMessageObjectType];
