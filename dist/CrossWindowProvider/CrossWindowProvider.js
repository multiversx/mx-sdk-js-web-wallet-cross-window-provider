var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Transaction } from '@multiversx/sdk-core';
import { ErrAccountNotConnected, ErrCannotSignSingleTransaction, ErrCouldNotLogin, ErrCouldNotSignMessage, ErrCouldNotSignTransactions, ErrCouldNotGuardTransactions, ErrInstantiationFailed, ErrProviderNotInitialized, ErrTransactionCancelled } from '../errors';
import { CrossWindowProviderRequestEnums, CrossWindowProviderResponseEnums, SignMessageStatusEnum } from '../types';
import { WindowManager } from './WindowManager';
class CrossWindowProvider {
    constructor() {
        this.account = { address: '' };
        this.initialized = false;
        this.windowManager = null;
        this.accessToken = undefined;
        if (CrossWindowProvider._instance) {
            throw new ErrInstantiationFailed();
        }
        CrossWindowProvider._instance = this;
    }
    ensureConnected() {
        if (!this.account.address) {
            throw new ErrAccountNotConnected();
        }
    }
    disconnect() {
        this.account = { address: '' };
    }
    static getInstance() {
        if (!CrossWindowProvider._instance) {
            return new CrossWindowProvider();
        }
        return CrossWindowProvider._instance;
    }
    setAddress(address) {
        if (!CrossWindowProvider._instance) {
            throw new ErrInstantiationFailed();
        }
        this.account.address = address;
        return CrossWindowProvider._instance;
    }
    setWalletUrl(url) {
        if (!CrossWindowProvider._instance || !this.windowManager) {
            throw new ErrInstantiationFailed();
        }
        this.windowManager.setWalletUrl(url);
        return CrossWindowProvider._instance;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.windowManager = WindowManager.getInstance();
            this.initialized = yield this.windowManager.init();
            return this.initialized;
        });
    }
    login(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialized) {
                throw new ErrProviderNotInitialized();
            }
            const isRelogin = yield this.isConnected();
            if (isRelogin) {
                const { address, signature, multisig, impersonate } = this.account;
                return {
                    address,
                    signature,
                    multisig,
                    impersonate
                };
            }
            this.accessToken = options.token;
            if (!this.windowManager) {
                throw new ErrInstantiationFailed();
            }
            const { payload: { data, error } } = yield this.windowManager.postMessage({
                type: CrossWindowProviderRequestEnums.loginRequest,
                payload: {
                    token: this.accessToken
                }
            });
            if (error || !data) {
                throw new ErrCouldNotLogin();
            }
            this.account.address = data.address;
            this.account.signature = data.signature;
            this.account.multisig = data.multisig;
            this.account.impersonate = data.impersonate;
            return {
                address: this.account.address,
                signature: this.account.signature,
                multisig: this.account.multisig,
                impersonate: this.account.impersonate
            };
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialized || !this.windowManager) {
                throw new ErrProviderNotInitialized();
            }
            this.ensureConnected();
            const connectionClosed = yield this.windowManager.closeConnection();
            this.initialized = false;
            this.disconnect();
            return connectionClosed;
        });
    }
    getAddress() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialized) {
                throw new ErrProviderNotInitialized();
            }
            return (_b = (_a = this.account) === null || _a === void 0 ? void 0 : _a.address) !== null && _b !== void 0 ? _b : '';
        });
    }
    isInitialized() {
        return this.initialized;
    }
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            return Boolean(this.account.address);
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            const signedTransactions = yield this.signTransactions([transaction]);
            if (signedTransactions.length != 1) {
                throw new ErrCannotSignSingleTransaction();
            }
            return signedTransactions[0];
        });
    }
    signTransactions(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            if (!this.windowManager) {
                throw new ErrInstantiationFailed();
            }
            const { type, payload: { data: signedPlainTransactions, error } } = yield this.windowManager.postMessage({
                type: CrossWindowProviderRequestEnums.signTransactionsRequest,
                payload: transactions.map((tx) => tx.toPlainObject())
            });
            if (error || !signedPlainTransactions) {
                throw new ErrCouldNotSignTransactions();
            }
            if (type === CrossWindowProviderResponseEnums.cancelResponse) {
                throw new ErrTransactionCancelled();
            }
            const hasTransactions = (signedPlainTransactions === null || signedPlainTransactions === void 0 ? void 0 : signedPlainTransactions.length) > 0;
            if (!hasTransactions) {
                throw new ErrCouldNotSignTransactions();
            }
            return signedPlainTransactions.map((tx) => Transaction.fromPlainObject(tx));
        });
    }
    guardTransactions(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            if (!this.windowManager) {
                throw new ErrInstantiationFailed();
            }
            const { type, payload: { data: signedPlainTransactions, error } } = yield this.windowManager.postMessage({
                type: CrossWindowProviderRequestEnums.guardTransactionsRequest,
                payload: transactions.map((tx) => tx.toPlainObject())
            });
            if (error || !signedPlainTransactions) {
                throw new ErrCouldNotSignTransactions();
            }
            if (type === CrossWindowProviderResponseEnums.cancelResponse) {
                throw new ErrTransactionCancelled();
            }
            const hasTransactions = (signedPlainTransactions === null || signedPlainTransactions === void 0 ? void 0 : signedPlainTransactions.length) > 0;
            if (!hasTransactions) {
                throw new ErrCouldNotGuardTransactions();
            }
            return signedPlainTransactions.map((tx) => Transaction.fromPlainObject(tx));
        });
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ensureConnected();
            if (!this.windowManager) {
                throw new ErrInstantiationFailed();
            }
            const { payload: { data, error } } = yield this.windowManager.postMessage({
                type: CrossWindowProviderRequestEnums.signMessageRequest,
                payload: {
                    message: message.message.toString()
                }
            });
            if (error || !data) {
                throw new ErrCouldNotSignMessage();
            }
            const { status, signature } = data;
            if (status !== SignMessageStatusEnum.signed) {
                throw new ErrCouldNotSignMessage();
            }
            message.applySignature(Buffer.from(String(signature), 'hex'));
            return message;
        });
    }
    cancelAction() {
        var _a;
        return (_a = this.windowManager) === null || _a === void 0 ? void 0 : _a.postMessage({
            type: CrossWindowProviderRequestEnums.cancelAction,
            payload: undefined
        });
    }
}
CrossWindowProvider._instance = null;
export { CrossWindowProvider };
//# sourceMappingURL=CrossWindowProvider.js.map