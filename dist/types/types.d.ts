import type { IPlainTransactionObject } from '@multiversx/sdk-core';
export declare enum CrossWindowProviderRequestEnums {
    signTransactionsRequest = "SIGN_TRANSACTIONS_REQUEST",
    guardTransactionsRequest = "GUARD_TRANSACTIONS_REQUEST",
    signMessageRequest = "SIGN_MESSAGE_REQUEST",
    loginRequest = "LOGIN_REQUEST",
    logoutRequest = "LOGOUT_REQUEST",
    cancelAction = "CANCEL_ACTION_REQUEST",
    finalizeHandshakeRequest = "FINALIZE_HANDSHAKE_REQUEST",
    finalizeResetStateRequest = "FINALIZE_RESET_STATE_REQUEST"
}
export declare enum CrossWindowProviderResponseEnums {
    handshakeResponse = "HANDSHAKE_RESPONSE",
    guardTransactionsResponse = "GUARD_TRANSACTIONS_RESPONSE",
    loginResponse = "LOGIN_RESPONSE",
    disconnectResponse = "DISCONNECT_RESPONSE",
    cancelResponse = "CANCEL_RESPONSE",
    signTransactionsResponse = "SIGN_TRANSACTIONS_RESPONSE",
    signMessageResponse = "SIGN_MESSAGE_RESPONSE",
    noneResponse = "NONE_RESPONSE",
    resetStateResponse = "RESET_STATE_RESPONSE"
}
export declare enum SignMessageStatusEnum {
    pending = "pending",
    failed = "failed",
    signed = "signed",
    cancelled = "cancelled"
}
export type ReplyWithPostMessageObjectType = {
    [CrossWindowProviderResponseEnums.handshakeResponse]: boolean;
    [CrossWindowProviderResponseEnums.loginResponse]: {
        address: string;
        accessToken?: string;
        name?: string;
        signature?: string;
        multisig?: string;
        impersonate?: string;
    };
    [CrossWindowProviderResponseEnums.disconnectResponse]: boolean;
    [CrossWindowProviderResponseEnums.cancelResponse]: {
        address: string;
    };
    [CrossWindowProviderResponseEnums.signTransactionsResponse]: IPlainTransactionObject[];
    [CrossWindowProviderResponseEnums.guardTransactionsResponse]: IPlainTransactionObject[];
    [CrossWindowProviderResponseEnums.signMessageResponse]: {
        signature?: string;
        status: SignMessageStatusEnum;
    };
    [CrossWindowProviderResponseEnums.noneResponse]: null;
    [CrossWindowProviderResponseEnums.resetStateResponse]: boolean;
};
export type ReplyWithPostMessagePayloadType<K extends keyof ReplyWithPostMessageObjectType> = {
    data?: ReplyWithPostMessageObjectType[K];
    error?: string;
};
export type ReplyWithPostMessageType = {
    [K in keyof ReplyWithPostMessageObjectType]: {
        type: K;
        payload: ReplyWithPostMessagePayloadType<K>;
    };
}[keyof ReplyWithPostMessageObjectType];
export type ResponseTypeMap = {
    [CrossWindowProviderRequestEnums.signTransactionsRequest]: CrossWindowProviderResponseEnums.signTransactionsResponse;
    [CrossWindowProviderRequestEnums.signMessageRequest]: CrossWindowProviderResponseEnums.signMessageResponse;
    [CrossWindowProviderRequestEnums.loginRequest]: CrossWindowProviderResponseEnums.loginResponse;
    [CrossWindowProviderRequestEnums.logoutRequest]: CrossWindowProviderResponseEnums.disconnectResponse;
    [CrossWindowProviderRequestEnums.guardTransactionsRequest]: CrossWindowProviderResponseEnums.guardTransactionsResponse;
    [CrossWindowProviderRequestEnums.cancelAction]: CrossWindowProviderResponseEnums.cancelResponse;
    [CrossWindowProviderRequestEnums.finalizeHandshakeRequest]: CrossWindowProviderResponseEnums.noneResponse;
    [CrossWindowProviderRequestEnums.finalizeResetStateRequest]: CrossWindowProviderResponseEnums.resetStateResponse;
};
export type RequestPayloadType = {
    [CrossWindowProviderRequestEnums.loginRequest]: {
        token: string | undefined;
    };
    [CrossWindowProviderRequestEnums.logoutRequest]: undefined;
    [CrossWindowProviderRequestEnums.signTransactionsRequest]: IPlainTransactionObject[];
    [CrossWindowProviderRequestEnums.guardTransactionsRequest]: IPlainTransactionObject[];
    [CrossWindowProviderRequestEnums.signMessageRequest]: {
        message: string;
    };
    [CrossWindowProviderRequestEnums.cancelAction]: undefined;
    [CrossWindowProviderRequestEnums.finalizeHandshakeRequest]: undefined;
    [CrossWindowProviderRequestEnums.finalizeResetStateRequest]: undefined;
};
export type RequestMessageType = {
    [K in keyof RequestPayloadType]: {
        type: K;
        payload: RequestPayloadType[K];
    };
}[keyof RequestPayloadType];
export type ReplyWithPostMessageEventType = {
    [K in keyof ReplyWithPostMessageObjectType]: {
        type: CrossWindowProviderResponseEnums;
        payload: ReplyWithPostMessageObjectType[K];
    };
}[keyof ReplyWithPostMessageObjectType];
export interface PostMessageParamsType<T extends CrossWindowProviderRequestEnums> {
    type: T;
    payload: RequestPayloadType[keyof RequestPayloadType];
}
export interface PostMessageReturnType<T extends CrossWindowProviderRequestEnums> {
    type: ResponseTypeMap[T] | CrossWindowProviderResponseEnums.cancelResponse;
    payload: ReplyWithPostMessagePayloadType<ResponseTypeMap[T]>;
}
