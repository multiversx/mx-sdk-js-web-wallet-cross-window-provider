export var CrossWindowProviderRequestEnums;
(function (CrossWindowProviderRequestEnums) {
    CrossWindowProviderRequestEnums["signTransactionsRequest"] = "SIGN_TRANSACTIONS_REQUEST";
    CrossWindowProviderRequestEnums["guardTransactionsRequest"] = "GUARD_TRANSACTIONS_REQUEST";
    CrossWindowProviderRequestEnums["signMessageRequest"] = "SIGN_MESSAGE_REQUEST";
    CrossWindowProviderRequestEnums["loginRequest"] = "LOGIN_REQUEST";
    CrossWindowProviderRequestEnums["logoutRequest"] = "LOGOUT_REQUEST";
    CrossWindowProviderRequestEnums["cancelAction"] = "CANCEL_ACTION_REQUEST";
    CrossWindowProviderRequestEnums["finalizeHandshakeRequest"] = "FINALIZE_HANDSHAKE_REQUEST";
    CrossWindowProviderRequestEnums["finalizeResetStateRequest"] = "FINALIZE_RESET_STATE_REQUEST";
})(CrossWindowProviderRequestEnums || (CrossWindowProviderRequestEnums = {}));
export var CrossWindowProviderResponseEnums;
(function (CrossWindowProviderResponseEnums) {
    CrossWindowProviderResponseEnums["handshakeResponse"] = "HANDSHAKE_RESPONSE";
    CrossWindowProviderResponseEnums["guardTransactionsResponse"] = "GUARD_TRANSACTIONS_RESPONSE";
    CrossWindowProviderResponseEnums["loginResponse"] = "LOGIN_RESPONSE";
    CrossWindowProviderResponseEnums["disconnectResponse"] = "DISCONNECT_RESPONSE";
    CrossWindowProviderResponseEnums["cancelResponse"] = "CANCEL_RESPONSE";
    CrossWindowProviderResponseEnums["signTransactionsResponse"] = "SIGN_TRANSACTIONS_RESPONSE";
    CrossWindowProviderResponseEnums["signMessageResponse"] = "SIGN_MESSAGE_RESPONSE";
    CrossWindowProviderResponseEnums["noneResponse"] = "NONE_RESPONSE";
    CrossWindowProviderResponseEnums["resetStateResponse"] = "RESET_STATE_RESPONSE";
})(CrossWindowProviderResponseEnums || (CrossWindowProviderResponseEnums = {}));
export var SignMessageStatusEnum;
(function (SignMessageStatusEnum) {
    SignMessageStatusEnum["pending"] = "pending";
    SignMessageStatusEnum["failed"] = "failed";
    SignMessageStatusEnum["signed"] = "signed";
    SignMessageStatusEnum["cancelled"] = "cancelled";
})(SignMessageStatusEnum || (SignMessageStatusEnum = {}));
//# sourceMappingURL=types.js.map