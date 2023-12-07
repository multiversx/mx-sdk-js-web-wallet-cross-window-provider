import { SignableMessage, Transaction } from '@multiversx/sdk-core';
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
import { CrossWindowProviderRequestEnums, CrossWindowProviderResponseEnums, SignMessageStatusEnum } from './types';

interface ICrossWindowWalletAccount {
  address: string;
  /*
   * What does name represent?
   */
  name?: string;
  signature?: string;
}

export const DAPP_WINDOW_NAME = window.location.origin;

export class CrossWindowProvider {
  private walletUrl = '';
  public account: ICrossWindowWalletAccount = { address: '' };
  private initialized = false;
  private static _instance: CrossWindowProvider = new CrossWindowProvider();
  walletWindow: Window | null = null;
  private handshakeEstablished = false;
  private accessToken: string | undefined = undefined;

  private constructor() {
    if (CrossWindowProvider._instance) {
      throw new ErrInstantiationFailed();
    }
    window.addEventListener('beforeunload', () => {
      this.walletWindow?.close();
    });

    window.name = window.name = DAPP_WINDOW_NAME;
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
    this.walletUrl = url;
    return CrossWindowProvider._instance;
  }

  async init(): Promise<boolean> {
    window.name = DAPP_WINDOW_NAME;
    this.initialized = true;
    return this.initialized;
  }

  async handshake(): Promise<boolean> {
    this..walletWindow?.close();
    this.walletWindow = window.open(this.walletUrl, this.walletUrl);
    const { payload } = await this.listenOnce(CrossWindowProviderResponseEnums.handshakeResponse );

    if (!payload) {
      throw new ErrCannotEstablishHandshake();
    }
    this.addHandshakeChangeListener();

    this.handshakeEstablished = true;
    return true;
  }

  private async addHandshakeChangeListener() {
    const walletUrl = this.walletUrl;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    window.addEventListener('message', function eventHandler(event) {
      try {
        const { type, payload } = event.data;
        const isWalletEvent = event.origin === new URL(walletUrl).origin;

        if (isWalletEvent && type === CrossWindowProviderResponseEnums.handshakeResponse) {
          if (payload === false) {
            self.walletWindow?.close();
            self.handshakeEstablished = false;
            self.walletWindow = null;
            window.removeEventListener('message', eventHandler);
          }
        }
      } catch {}
    });
  }

  async listenOnce(action: CrossWindowProviderResponseEnums): Promise<any> {
    if (!this.walletWindow) {
      throw new ErrWalletWindowNotInstantiated();
    }
    const self = this;

    return await new Promise((resolve) => {
      const walletUrl = this.walletUrl;
      window.addEventListener('message', async function eventHandler(event) {
          const { type, payload } = event.data;
          const isWalletEvent = event.origin === new URL(walletUrl).origin;
          const isCurrentAction = action === type || type === CrossWindowProviderResponseEnums.cancelResponse;
          const isRelogin = await self.isConnected();


          if (!isCurrentAction) {
            return;
          }
          console.log("respond listen once: ", type);

          if (isWalletEvent) {
            window.removeEventListener('message', eventHandler);
            resolve({ type, payload });
          }
      });
    });
  }

  private async connectWallet() {
    const payloadQueryString = buildWalletQueryString({
      params: {
        token: this.accessToken
      }
    });
    const isRelogin = await this.isConnected();
    this.walletWindow?.postMessage(
      {
        type: CrossWindowProviderRequestEnums.loginRequest,
        payload: { queryString: payloadQueryString }
      },
      this.walletUrl
    );

    if (!isRelogin) {

      const {
        payload: { address, signature }
      } = await this.listenOnce(CrossWindowProviderResponseEnums.loginResponse);

      this.account.address = address;
      this.account.signature = signature;
    }
  }

  async login(
    options: {
      token?: string;
    } = {}
  ): Promise<{address: string, signature: string | undefined}> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }
  
    this.accessToken = options.token;

    await this.handshake();
    await this.connectWallet();

    this.walletWindow?.close();

    return {address: this.account.address, signature: this.account.signature};
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
      { type: CrossWindowProviderRequestEnums.signTransactionsRequest, payload: payloadQueryString },
      this.walletUrl
    );

    const { type, payload: signedPlainTransactions }: any =
      await this.listenOnce(CrossWindowProviderResponseEnums.signTransactionsResponse);

    this.walletWindow?.close();

    if (type === CrossWindowProviderResponseEnums.cancelResponse) {
      throw new ErrTransactionCAncelled();
    }

    if (!signedPlainTransactions || !signedPlainTransactions.length) {
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
      { type: CrossWindowProviderRequestEnums.signMessageRequest, payload: payloadQueryString },
      this.walletUrl
    );
    const {
      payload: { status, signature }
    } = await this.listenOnce(CrossWindowProviderResponseEnums.signMessageResponse);

    this.walletWindow?.close();

    if (status !== SignMessageStatusEnum.signed) {
      throw new ErrCouldNotSignMessage();
    }

    message.applySignature(Buffer.from(signature, 'hex'));

    return message;
  }

  cancelAction() {
    this.walletWindow?.postMessage(
      { type: CrossWindowProviderRequestEnums.cancelAction },
      this.walletUrl
    );
  }
}
