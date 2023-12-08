import { SignableMessage, Transaction } from '@multiversx/sdk-core';
import {
  ErrAccountNotConnected,
  ErrCannotSignSingleTransaction,
  ErrCouldNotSignMessage,
  ErrCouldNotSignTransaction,
  ErrInstantiationFailed,
  ErrProviderNotInitialized,
  ErrTransactionCancelled
} from './errors';
import {
  buildTransactionsQueryString,
  buildWalletQueryString
} from './helpers';
import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums,
  SignMessageStatusEnum
} from './types';
import { WindowManager } from './WindowManager';

interface ICrossWindowWalletAccount {
  address: string;
  signature?: string;
}

export class CrossWindowProvider {
  public account: ICrossWindowWalletAccount = { address: '' };
  private initialized = false;
  private windowManager: WindowManager;
  private static _instance: CrossWindowProvider = new CrossWindowProvider();
  private accessToken: string | undefined = undefined;

  private constructor() {
    if (CrossWindowProvider._instance) {
      throw new ErrInstantiationFailed();
    }
    this.windowManager = WindowManager.getInstance();
    CrossWindowProvider._instance = this;
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
  ): Promise<{ address: string; signature: string | undefined }> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }

    const isRelogin = await this.isConnected();

    if (isRelogin) {
      const { address, signature } = this.account;
      return {
        address,
        signature
      };
    }

    this.accessToken = options.token;

    const payloadQueryString = buildWalletQueryString({
      params: {
        token: this.accessToken
      }
    });

    const {
      payload: { address, signature }
    } = await this.windowManager.postMessage({
      type: CrossWindowProviderRequestEnums.loginRequest,
      payload: { queryString: payloadQueryString } as any // TODO: needs to change to plain qyerystirng
    });

    this.account.address = address;
    this.account.signature = signature;

    return { address: this.account.address, signature: this.account.signature };
  }

  async logout(): Promise<boolean> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }
    this.ensureConnected();
    this.disconnect();
    const connectionClosed = await this.windowManager.closeConnection();
    // TODO: postMessage to wallet to logout

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

    const payloadQueryString = buildTransactionsQueryString(transactions);

    const { type, payload: signedPlainTransactions } =
      await this.windowManager.postMessage({
        type: CrossWindowProviderRequestEnums.signTransactionsRequest,
        payload: payloadQueryString
      });

    if (type === CrossWindowProviderResponseEnums.cancelResponse) {
      throw new ErrTransactionCancelled();
    }

    const hasTransactions = signedPlainTransactions?.length > 0;

    if (!hasTransactions) {
      throw new ErrCouldNotSignTransaction();
    }

    const signedTransactions = signedPlainTransactions.map((tx) => {
      const transaction = Transaction.fromPlainObject(tx);
      return transaction;
    });

    return signedTransactions;
  }

  async signMessage(message: SignableMessage): Promise<SignableMessage> {
    this.ensureConnected();

    const payloadQueryString = buildWalletQueryString({
      params: {
        message: message.message.toString()
      }
    });

    const {
      payload: { status, signature }
    } = await this.windowManager.postMessage({
      type: CrossWindowProviderRequestEnums.signMessageRequest,
      payload: payloadQueryString
    });

    if (status !== SignMessageStatusEnum.signed) {
      throw new ErrCouldNotSignMessage();
    }

    message.applySignature(Buffer.from(String(signature), 'hex'));

    return message;
  }

  cancelAction() {
    this.windowManager?.postMessage({
      type: CrossWindowProviderRequestEnums.cancelAction,
      payload: ''
    });
  }
}
