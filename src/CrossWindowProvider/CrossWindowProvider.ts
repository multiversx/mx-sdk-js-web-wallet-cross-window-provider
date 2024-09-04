import { Message, Transaction } from '@multiversx/sdk-core';
import {
  WindowProviderRequestEnums,
  WindowProviderResponseEnums,
  SignMessageStatusEnum
} from '@multiversx/sdk-dapp-utils/out/enums';
import {
  IDAppProviderAccount,
  IDAppProviderBase
} from '@multiversx/sdk-dapp-utils/out/models/dappProviderBase';
import { safeWindow } from '../constants';
import {
  ErrAccountNotConnected,
  ErrCannotSignSingleTransaction,
  ErrCouldNotGuardTransactions,
  ErrCouldNotLogin,
  ErrCouldNotSignMessage,
  ErrCouldNotSignTransactions,
  ErrProviderNotInitialized,
  ErrTransactionCancelled
} from '../errors';
import { WindowManager } from '../WindowManager';
import { confirmationDialogTag } from './PopupConsent/constants';
import { PopupConsentModel } from './PopupConsent/PopupConsent.model';

export class CrossWindowProvider implements IDAppProviderBase {
  private account: IDAppProviderAccount = { address: '' };
  private accessToken: string | undefined = undefined;

  protected initialized = false;
  protected windowManager: WindowManager;
  protected _shouldShowConsentPopup = false;
  protected static _instance: CrossWindowProvider | null = null;

  public constructor() {
    this.windowManager = new WindowManager();
  }

  public setShouldShowConsentPopup(shouldShow: boolean) {
    this._shouldShowConsentPopup = shouldShow;
  }

  protected ensureConnected() {
    if (!this.account.address) {
      throw new ErrAccountNotConnected();
    }
  }

  protected disconnect() {
    this.account = { address: '' };
  }

  public static getInstance(): CrossWindowProvider {
    if (!CrossWindowProvider._instance) {
      CrossWindowProvider._instance = new CrossWindowProvider();
      return CrossWindowProvider._instance;
    }

    return CrossWindowProvider._instance;
  }

  public getWindowManager(): WindowManager {
    return this.windowManager;
  }

  public setAddress(address: string): CrossWindowProvider {
    this.account.address = address;
    return this;
  }

  public setWalletUrl(url: string): CrossWindowProvider {
    this.windowManager.setWalletUrl(url);
    return this;
  }

  public setWalletWindow(): Promise<void> {
    return this.windowManager.setWalletWindow();
  }

  async init(): Promise<boolean> {
    this.initialized = await this.windowManager.init();
    return this.initialized;
  }

  async login(
    options: {
      token?: string;
    } = {}
  ): Promise<IDAppProviderAccount> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }

    const isRelogin = this.isConnected();

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
      type: WindowProviderRequestEnums.loginRequest,
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

  async dispose(): Promise<boolean> {
    const connectionClosed = await this.windowManager.closeConnection();
    return connectionClosed;
  }

  async logout(): Promise<boolean> {
    const popupConsentResponse = await this.openPopupConsent();

    if (!this.initialized || !popupConsentResponse) {
      throw new ErrProviderNotInitialized();
    }

    this.ensureConnected();
    const connectionClosed = await this.dispose();
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

  isInitialized = (): boolean => {
    return this.initialized;
  };

  isConnected(): boolean {
    return Boolean(this.account.address);
  }

  getAccount(): IDAppProviderAccount | null {
    return this.account;
  }

  setAccount(account: IDAppProviderAccount): void {
    this.account = account;
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
      type: WindowProviderRequestEnums.signTransactionsRequest,
      payload: transactions.map((tx) => tx.toPlainObject())
    });

    if (error || !signedPlainTransactions) {
      throw new ErrCouldNotSignTransactions();
    }

    if (type === WindowProviderResponseEnums.cancelResponse) {
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
      type: WindowProviderRequestEnums.guardTransactionsRequest,
      payload: transactions.map((tx) => tx.toPlainObject())
    });

    if (error || !signedPlainTransactions) {
      throw new ErrCouldNotSignTransactions();
    }

    if (type === WindowProviderResponseEnums.cancelResponse) {
      throw new ErrTransactionCancelled();
    }

    const hasTransactions = signedPlainTransactions?.length > 0;

    if (!hasTransactions) {
      throw new ErrCouldNotGuardTransactions();
    }

    return signedPlainTransactions.map((tx) => Transaction.fromPlainObject(tx));
  }

  async signMessage(messageToSign: string): Promise<Message> {
    this.ensureConnected();

    const popupConsentResponse = await this.openPopupConsent();

    if (!popupConsentResponse) {
      throw new ErrCouldNotSignMessage();
    }

    const {
      payload: { data, error }
    } = await this.windowManager.postMessage({
      type: WindowProviderRequestEnums.signMessageRequest,
      payload: {
        message: messageToSign
      }
    });

    if (error || !data) {
      throw new ErrCouldNotSignMessage();
    }

    const { status, signature } = data;

    if (status !== SignMessageStatusEnum.signed) {
      throw new ErrCouldNotSignMessage();
    }

    const message = new Message({
      data: Buffer.from(messageToSign)
    });
    message.signature = Buffer.from(String(signature), 'hex');

    return message;
  }

  cancelAction() {
    const isWalletOpened = this.windowManager?.isWalletOpened(
      WindowProviderRequestEnums.cancelAction
    );

    if (!isWalletOpened) {
      return;
    }

    return this.windowManager?.postMessage({
      type: WindowProviderRequestEnums.cancelAction,
      payload: undefined
    });
  }

  public async openPopupConsent(): Promise<boolean> {
    if (
      !this._shouldShowConsentPopup ||
      typeof document === 'undefined' ||
      typeof window === 'undefined'
    ) {
      return true;
    }

    const module = await import('./PopupConsent/PopupConsent');
    const PopupConsent = module.PopupConsent;

    const customElements = safeWindow.customElements;
    if (customElements && !customElements.get(confirmationDialogTag)) {
      customElements.define(confirmationDialogTag, PopupConsent);
    }

    const popup = document.createElement(
      confirmationDialogTag
    ) as PopupConsentModel & HTMLElement;

    popup.walletUrl = this.windowManager.walletUrl;

    document.body.appendChild(popup);

    const popupConsentResponse: boolean = await new Promise<boolean>(
      (resolve) => {
        popup.onConfirm = () => {
          resolve(true);
          document.body.removeChild(popup);
        };
        popup.onCancel = () => {
          resolve(false);
          document.body.removeChild(popup);
        };
      }
    );

    this._shouldShowConsentPopup = false;
    return popupConsentResponse;
  }
}
