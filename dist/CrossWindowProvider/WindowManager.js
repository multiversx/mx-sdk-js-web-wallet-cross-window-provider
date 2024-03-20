var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { responseTypeMap, safeWindow } from '../constants';
import { ErrCannotEstablishHandshake, ErrProviderNotInitialized, ErrWalletWindowNotInstantiated } from '../errors';
import { CrossWindowProviderRequestEnums, CrossWindowProviderResponseEnums } from '../types';
class WindowManager {
    constructor() {
        var _a, _b;
        this.walletUrl = '';
        this.initialized = false;
        this.walletWindow = null;
        (_a = safeWindow.addEventListener) === null || _a === void 0 ? void 0 : _a.call(safeWindow, 'beforeunload', () => {
            this.closeWalletWindow();
        });
        safeWindow.name = (_b = safeWindow.location) === null || _b === void 0 ? void 0 : _b.origin;
        WindowManager._instance = this;
    }
    static getInstance() {
        if (!WindowManager._instance) {
            return new WindowManager();
        }
        return WindowManager._instance;
    }
    setWalletUrl(url) {
        this.walletUrl = url;
        return this;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialized = true;
            return this.initialized;
        });
    }
    setWalletWindow() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.walletWindow =
                (_b = (_a = safeWindow.open) === null || _a === void 0 ? void 0 : _a.call(safeWindow, this.walletUrl, this.walletUrl)) !== null && _b !== void 0 ? _b : null;
        });
    }
    closeWalletWindow() {
        var _a;
        (_a = this.walletWindow) === null || _a === void 0 ? void 0 : _a.close();
    }
    isWalletOpened(type) {
        return (type === CrossWindowProviderRequestEnums.cancelAction &&
            Boolean(this.walletWindow));
    }
    handshake(type) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isWalletOpened(type)) {
                return true;
            }
            this.closeWalletWindow();
            yield this.setWalletWindow();
            const { payload: isWalletReady } = yield this.listenOnce(CrossWindowProviderResponseEnums.handshakeResponse);
            if (!isWalletReady) {
                throw new ErrCannotEstablishHandshake();
            }
            (_a = this.walletWindow) === null || _a === void 0 ? void 0 : _a.postMessage({
                type: CrossWindowProviderRequestEnums.finalizeHandshakeRequest
            }, this.walletUrl);
            this.addHandshakeChangeListener();
            return true;
        });
    }
    addHandshakeChangeListener() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const walletUrl = this.walletUrl;
            const eventHandler = (event) => {
                var _a;
                try {
                    const { type, payload } = event.data;
                    const isWalletEvent = event.origin === new URL(walletUrl).origin;
                    if (!isWalletEvent) {
                        return;
                    }
                    switch (type) {
                        case CrossWindowProviderResponseEnums.handshakeResponse:
                            if (payload === false) {
                                this.closeWalletWindow();
                                this.walletWindow = null;
                                (_a = safeWindow.removeEventListener) === null || _a === void 0 ? void 0 : _a.call(safeWindow, 'message', eventHandler);
                            }
                            break;
                    }
                }
                catch (_b) { }
            };
            (_a = safeWindow.addEventListener) === null || _a === void 0 ? void 0 : _a.call(safeWindow, 'message', eventHandler);
        });
    }
    listenOnce(action) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.walletWindow) {
                throw new ErrWalletWindowNotInstantiated();
            }
            return yield new Promise((resolve) => {
                var _a;
                const walletUrl = this.walletUrl;
                (_a = safeWindow.addEventListener) === null || _a === void 0 ? void 0 : _a.call(safeWindow, 'message', function eventHandler(event) {
                    var _a;
                    return __awaiter(this, void 0, void 0, function* () {
                        const { type, payload } = event.data;
                        const isWalletEvent = event.origin === new URL(walletUrl).origin;
                        const isCurrentAction = action === type ||
                            type === CrossWindowProviderResponseEnums.cancelResponse;
                        if (!isCurrentAction || !isWalletEvent) {
                            return;
                        }
                        (_a = safeWindow.removeEventListener) === null || _a === void 0 ? void 0 : _a.call(safeWindow, 'message', eventHandler);
                        resolve({ type, payload });
                    });
                });
            });
        });
    }
    closeConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialized) {
                throw new ErrProviderNotInitialized();
            }
            yield this.postMessage({
                type: CrossWindowProviderRequestEnums.logoutRequest,
                payload: undefined
            });
            return true;
        });
    }
    isInitialized() {
        return this.initialized;
    }
    postMessage({ type, payload }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handshake(type);
            (_a = this.walletWindow) === null || _a === void 0 ? void 0 : _a.postMessage({
                type,
                payload
            }, this.walletUrl);
            const data = yield this.listenOnce(responseTypeMap[type]);
            this.closeWalletWindow();
            return data;
        });
    }
}
WindowManager._instance = null;
export { WindowManager };
//# sourceMappingURL=WindowManager.js.map