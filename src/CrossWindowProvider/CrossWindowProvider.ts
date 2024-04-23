import { SignableMessage, Transaction } from '@multiversx/sdk-core';
import { safeWindow } from '../constants';
import {
  ErrAccountNotConnected,
  ErrCannotSignSingleTransaction,
  ErrCouldNotGuardTransactions,
  ErrCouldNotLogin,
  ErrCouldNotSignMessage,
  ErrCouldNotSignTransactions,
  ErrInstantiationFailed,
  ErrProviderNotInitialized,
  ErrTransactionCancelled
} from '../errors';
import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums,
  SignMessageStatusEnum
} from '../types';
import { WindowManager } from '../WindowManager';
import { PopupConsent, confirmationDialogTag } from './PopupConsent';

interface ICrossWindowWalletAccount {
  address: string;
  signature?: string;
  multisig?: string;
  impersonate?: string;
}

export class CrossWindowProvider {
  public account: ICrossWindowWalletAccount = { address: '' };
  private initialized = false;
  private windowManager: WindowManager;
  private static _instance: CrossWindowProvider = new CrossWindowProvider();
  private accessToken: string | undefined = undefined;
  protected _shouldShowConsentPopup = false;

  private constructor() {
    if (CrossWindowProvider._instance) {
      throw new ErrInstantiationFailed();
    }
    this.windowManager = WindowManager.getInstance();
    CrossWindowProvider._instance = this;
  }

  public setShouldShowConsentPopup(shouldShow: boolean) {
    this._shouldShowConsentPopup = shouldShow;
  }

  private ensureConnected() {
    if (!this.account.address) {
      throw new ErrAccountNotConnected();
    }
  }

  private disconnect() {
    this.account = { address: '' };
  }

  public static getInstance(): CrossWindowProvider {
    return CrossWindowProvider._instance;
  }

  public setAddress(address: string): CrossWindowProvider {
    this.account.address = address;
    return CrossWindowProvider._instance;
  }

  public setWalletUrl(url: string): CrossWindowProvider {
    this.windowManager.setWalletUrl(url);
    return CrossWindowProvider._instance;
  }

  async init(): Promise<boolean> {
    this.initialized = await this.windowManager.init();
    return this.initialized;
  }

  async login(
    options: {
      token?: string;
    } = {}
  ): Promise<ICrossWindowWalletAccount> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }

    const isRelogin = await this.isConnected();

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

    const popupConsentResponse = await this.openPopupConsent();

    if (!popupConsentResponse) {
      throw new ErrCouldNotLogin();
    }

    const {
      payload: { data, error }
    } = await this.windowManager.postMessage({
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
  }

  async logout(): Promise<boolean> {
    const popupConsentResponse = await this.openPopupConsent();

    if (!this.initialized || !popupConsentResponse) {
      throw new ErrProviderNotInitialized();
    }

    this.ensureConnected();
    const connectionClosed = await this.windowManager.closeConnection();
    this.initialized = false;
    this.disconnect();

    return connectionClosed;
  }

  async getAddress(): Promise<string> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }
    return this.account?.address ?? '';
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async isConnected(): Promise<boolean> {
    return Boolean(this.account.address);
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    this.ensureConnected();

    const signedTransactions = await this.signTransactions([transaction]);

    if (signedTransactions.length != 1) {
      throw new ErrCannotSignSingleTransaction();
    }

    return signedTransactions[0];
  }

  async signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    this.ensureConnected();

    const popupConsentResponse = await this.openPopupConsent();

    if (!popupConsentResponse) {
      throw new ErrTransactionCancelled();
    }

    const {
      type,
      payload: { data: signedPlainTransactions, error }
    } = await this.windowManager.postMessage({
      type: CrossWindowProviderRequestEnums.signTransactionsRequest,
      payload: transactions.map((tx) => tx.toPlainObject())
    });

    if (error || !signedPlainTransactions) {
      throw new ErrCouldNotSignTransactions();
    }

    if (type === CrossWindowProviderResponseEnums.cancelResponse) {
      throw new ErrTransactionCancelled();
    }

    const hasTransactions = signedPlainTransactions?.length > 0;

    if (!hasTransactions) {
      throw new ErrCouldNotSignTransactions();
    }

    return signedPlainTransactions.map((tx) => Transaction.fromPlainObject(tx));
  }

  async guardTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    this.ensureConnected();

    const popupConsentResponse = await this.openPopupConsent();

    if (!popupConsentResponse) {
      throw new ErrTransactionCancelled();
    }

    const {
      type,
      payload: { data: signedPlainTransactions, error }
    } = await this.windowManager.postMessage({
      type: CrossWindowProviderRequestEnums.guardTransactionsRequest,
      payload: transactions.map((tx) => tx.toPlainObject())
    });

    if (error || !signedPlainTransactions) {
      throw new ErrCouldNotSignTransactions();
    }

    if (type === CrossWindowProviderResponseEnums.cancelResponse) {
      throw new ErrTransactionCancelled();
    }

    const hasTransactions = signedPlainTransactions?.length > 0;

    if (!hasTransactions) {
      throw new ErrCouldNotGuardTransactions();
    }

    return signedPlainTransactions.map((tx) => Transaction.fromPlainObject(tx));
  }

  async signMessage(message: SignableMessage): Promise<SignableMessage> {
    this.ensureConnected();

    const popupConsentResponse = await this.openPopupConsent();

    if (!popupConsentResponse) {
      throw new ErrCouldNotSignMessage();
    }

    const {
      payload: { data, error }
    } = await this.windowManager.postMessage({
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
  }

  cancelAction() {
    const isWalletOpened = this.windowManager?.isWalletOpened(
      CrossWindowProviderRequestEnums.cancelAction
    );
    if (!isWalletOpened) {
      return;
    }

    return this.windowManager?.postMessage({
      type: CrossWindowProviderRequestEnums.cancelAction,
      payload: undefined
    });
  }

  protected async openPopupConsent(): Promise<boolean> {
    require('./PopupConsent');
    const dialog = safeWindow.document?.createElement('div');
    const document = safeWindow.document;

    if (!this._shouldShowConsentPopup || !document || !dialog) {
      return true;
    }

    const popup = safeWindow.document?.createElement(
      confirmationDialogTag
    ) as PopupConsent;

    popup.walletUrl = this.windowManager.walletUrl;

    safeWindow.document?.body.appendChild(popup);

    const popupConsentResponse: boolean = await new Promise<boolean>(
      (resolve) => {
        popup.onConfirm = () => {
          resolve(true);
          safeWindow.document?.body.removeChild(popup);
        };
        popup.onCancel = () => {
          resolve(false);
          safeWindow.document?.body.removeChild(popup);
        };
      }
    );

    this._shouldShowConsentPopup = false;
    return popupConsentResponse;
  }
}
