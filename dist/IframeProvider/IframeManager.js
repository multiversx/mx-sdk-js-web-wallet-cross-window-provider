var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { defineCustomElements } from '@multiversx/sdk-dapp-ui/loader';
import { WindowManager } from '../CrossWindowProvider/WindowManager';
export class IframeManager extends WindowManager {
    constructor() {
        super();
        this.floatingWalletComponent = undefined;
        defineCustomElements();
    }
    get floatingWallet() {
        return this.floatingWalletComponent;
    }
    static getInstance() {
        if (!IframeManager._instance) {
            return new IframeManager();
        }
        return IframeManager._instance;
    }
    setWalletWindow() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.walletWindow) {
                return;
            }
            this.floatingWalletComponent = document.createElement('floating-wallet');
            this.floatingWalletComponent.walletAddress = this.walletUrl;
            document.body.appendChild(this.floatingWalletComponent);
            const iframe = yield new Promise((resolve) => {
                var _a;
                (_a = this.floatingWalletComponent) === null || _a === void 0 ? void 0 : _a.addEventListener('iframeWindowReady', (event) => {
                    resolve(event.detail);
                });
            });
            this.walletWindow = iframe.contentWindow;
        });
    }
    closeConnection() {
        const _super = Object.create(null, {
            closeConnection: { get: () => super.closeConnection }
        });
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield _super.closeConnection.call(this);
            (_a = this.floatingWalletComponent) === null || _a === void 0 ? void 0 : _a.remove();
            this.walletWindow = null;
            return result;
        });
    }
    isWalletOpened() {
        return Boolean(this.walletWindow);
    }
    closeWalletWindow() {
        var _a;
        (_a = this.floatingWallet) === null || _a === void 0 ? void 0 : _a.setWalletVisible(false);
    }
}
//# sourceMappingURL=IframeManager.js.map