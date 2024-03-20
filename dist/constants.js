import { CrossWindowProviderRequestEnums, CrossWindowProviderResponseEnums } from './types';
export const responseTypeMap = {
    [CrossWindowProviderRequestEnums.signTransactionsRequest]: CrossWindowProviderResponseEnums.signTransactionsResponse,
    [CrossWindowProviderRequestEnums.guardTransactionsRequest]: CrossWindowProviderResponseEnums.guardTransactionsResponse,
    [CrossWindowProviderRequestEnums.signMessageRequest]: CrossWindowProviderResponseEnums.signMessageResponse,
    [CrossWindowProviderRequestEnums.loginRequest]: CrossWindowProviderResponseEnums.loginResponse,
    [CrossWindowProviderRequestEnums.logoutRequest]: CrossWindowProviderResponseEnums.disconnectResponse,
    [CrossWindowProviderRequestEnums.cancelAction]: CrossWindowProviderResponseEnums.cancelResponse,
    [CrossWindowProviderRequestEnums.finalizeHandshakeRequest]: CrossWindowProviderResponseEnums.noneResponse,
    [CrossWindowProviderRequestEnums.finalizeResetStateRequest]: CrossWindowProviderResponseEnums.resetStateResponse
};
export const safeWindow = typeof window !== 'undefined' ? window : {};
//# sourceMappingURL=constants.js.map