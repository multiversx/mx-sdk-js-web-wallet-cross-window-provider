export enum WindowProviderRequestEnums {
  signTransactionsRequest = 'SIGN_TRANSACTIONS_REQUEST',
  guardTransactionsRequest = 'GUARD_TRANSACTIONS_REQUEST',
  signMessageRequest = 'SIGN_MESSAGE_REQUEST',
  loginRequest = 'LOGIN_REQUEST',
  reloginRequest = 'RELOGIN_REQUEST',
  logoutRequest = 'LOGOUT_REQUEST',
  cancelAction = 'CANCEL_ACTION_REQUEST',
  finalizeHandshakeRequest = 'FINALIZE_HANDSHAKE_REQUEST',
  finalizeResetStateRequest = 'FINALIZE_RESET_STATE_REQUEST'
}

export enum WindowProviderResponseEnums {
  handshakeResponse = 'HANDSHAKE_RESPONSE',
  guardTransactionsResponse = 'GUARD_TRANSACTIONS_RESPONSE',
  loginResponse = 'LOGIN_RESPONSE',
  reloginResponse = 'RELOGIN_RESPONSE',
  disconnectResponse = 'DISCONNECT_RESPONSE',
  cancelResponse = 'CANCEL_RESPONSE',
  signTransactionsResponse = 'SIGN_TRANSACTIONS_RESPONSE',
  signMessageResponse = 'SIGN_MESSAGE_RESPONSE',
  noneResponse = 'NONE_RESPONSE',
  resetStateResponse = 'RESET_STATE_RESPONSE',
  finalizeHandshakeResponse = 'FINALIZE_HANDSHAKE_RESPONSE'
}
