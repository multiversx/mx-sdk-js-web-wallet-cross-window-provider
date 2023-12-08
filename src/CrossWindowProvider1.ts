import { SignableMessage, Transaction } from '@multiversx/sdk-core';
import { CommunicationUtility } from './communicationUtility';
import { responseTypeMap } from './constants';
import {
  ErrAccountNotConnected,
  ErrCannotEstablishHandshake,
  ErrCannotSignSingleTransaction,
  ErrCouldNotSignMessage,
  ErrCouldNotSignTransaction,
  ErrInstantiationFailed,
  ErrProviderNotInitialized,
  ErrTransactionCAncelled,
  ErrWalletWindowNotInstantiated
} from './errors';
import {
  buildTransactionsQueryString,
  buildWalletQueryString
} from './helpers';
import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums,
  ReplyWithPostMessageType,
  SignMessageStatusEnum
} from './types';

interface ICrossWindowWalletAccount {
  address: string;
  signature?: string;
}

export const DAPP_WINDOW_NAME = window.location.origin;

export class CrossWindowProvider {
  private walletUrl = '';
  public account: ICrossWindowWalletAccount = { address: '' };
  private initialized = false;
  private communicator = new CommunicationUtility();
  private static _instance: CrossWindowProvider = new CrossWindowProvider();
  walletWindow: Window | null = null;
  private accessToken: string | undefined = undefined;

  private constructor() {
    if (CrossWindowProvider._instance) {
      throw new ErrInstantiationFailed();
    }
    CrossWindowProvider._instance = this;
  }

  public static getInstance(): CrossWindowProvider {
    return CrossWindowProvider._instance;
  }

  public setAddress(address: string): CrossWindowProvider {
    this.account.address = address;
    return CrossWindowProvider._instance;
  }

  public setWalletUrl(url: string): CrossWindowProvider {
    this.communicator.setWalletUrl(url);
    return CrossWindowProvider._instance;
  }

  async init(): Promise<boolean> {
    this.communicator.init();
    this.initialized = true;
    return this.initialized;
  }

  private async connectWallet() {
    const payloadQueryString = buildWalletQueryString({
      params: {
        token: this.accessToken
      }
    });
    const isRelogin = await this.isConnected();

    if (isRelogin) {
      return;
    }

    const {
      payload: { address, signature }
    } = await this.communicator.postMessage({
      type: CrossWindowProviderRequestEnums.loginRequest,
      payload: { queryString: payloadQueryString } as any // TODO: needs to change to plain qyerystirng
    });

    this.account.address = address;
    this.account.signature = signature;
  }

  async login(
    options: {
      token?: string;
    } = {}
  ): Promise<{ address: string; signature: string | undefined }> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }

    this.accessToken = options.token;

    await this.handshake();
    await this.connectWallet();

    this.walletWindow?.close();

    return { address: this.account.address, signature: this.account.signature };
  }

  async logout(): Promise<boolean> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }
    this.ensureConnected();
    await this.handshake();
    this.disconnect();
    this.walletWindow?.close();

    return true;
  }

  private disconnect() {
    this.account = { address: '' };
  }

  async getAddress(): Promise<string> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }
    return this.account ? this.account.address : '';
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

  private ensureConnected() {
    if (!this.account.address) {
      throw new ErrAccountNotConnected();
    }
  }

  async signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    this.ensureConnected();
    await this.handshake();
    await this.connectWallet();

    const payloadQueryString = buildTransactionsQueryString(transactions);
    this.walletWindow?.postMessage(
      {
        type: CrossWindowProviderRequestEnums.signTransactionsRequest,
        payload: payloadQueryString
      },
      this.walletUrl
    );

    const { type, payload: signedPlainTransactions }: any =
      await this.listenOnce(
        CrossWindowProviderResponseEnums.signTransactionsResponse
      );

    this.walletWindow?.close();

    if (type === CrossWindowProviderResponseEnums.cancelResponse) {
      throw new ErrTransactionCAncelled();
    }

    const hasTransactions = signedPlainTransactions?.length > 0;

    if (!hasTransactions) {
      throw new ErrCouldNotSignTransaction();
    }
    const signedTransactions = signedPlainTransactions.map((tx: any) => {
      const transaction = Transaction.fromPlainObject(tx);
      return transaction;
    });

    return signedTransactions;
  }

  async signMessage(message: SignableMessage): Promise<SignableMessage> {
    this.ensureConnected();
    await this.handshake();
    await this.connectWallet();
    const payloadQueryString = buildWalletQueryString({
      params: {
        message: message.message.toString()
      }
    });
    this.walletWindow?.postMessage(
      {
        type: CrossWindowProviderRequestEnums.signMessageRequest,
        payload: payloadQueryString
      },
      this.walletUrl
    );
    const {
      payload: { status, signature }
    } = await this.listenOnce(
      CrossWindowProviderResponseEnums.signMessageResponse
    );

    this.walletWindow?.close();

    if (status !== SignMessageStatusEnum.signed) {
      throw new ErrCouldNotSignMessage();
    }

    message.applySignature(Buffer.from(String(signature), 'hex'));

    return message;
  }

  cancelAction() {
    this.walletWindow?.postMessage(
      { type: CrossWindowProviderRequestEnums.cancelAction },
      this.walletUrl
    );
  }
}
