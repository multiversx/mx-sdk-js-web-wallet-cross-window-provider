import { IPlainTransactionObject, SignableMessage } from '@multiversx/sdk-core';
import { Transaction } from '@multiversx/sdk-core';
import qs from 'qs';
import {
  ErrAccountNotConnected,
  ErrCannotSignSingleTransaction
} from './errors';

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
  private callbackUrl: string | undefined = undefined;
  private accessToken: string | undefined = undefined;

  private constructor() {
    if (CrossWindowProvider._instance) {
      throw new Error(
        'Error: Instantiation failed: Use CrossWindowProvider.getInstance() instead of new.'
      );
    }
    window.addEventListener('beforeunload', () => {
      if (this.walletWindow && window.opener) {
        return this.walletWindow?.postMessage(
          { type: 'mxDappHandshake', payload: false }, // TODO: use const here
          this.walletUrl
        );
      }
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
    if (!this.walletWindow) {
      this.walletWindow = window.open(this.walletUrl, this.walletUrl);
    } else {
      window.open('', this.walletUrl);
    }

    if (this.handshakeEstablished) {
      return true;
    }

    const { type, payload } = await this.listenOnce();
    if (type !== 'handshake' || !payload) {
      throw new Error('Handshake could not be established');
    }

    this.walletWindow?.postMessage(
      { type: 'mxDappHandshake', payload: true },
      this.walletUrl
    );
    this.onHandshakeChangeListener();

    const payloadQueryString = this.buildWalletQueryString({
      params: {
        token: this.accessToken
      }
    });
    const isRelogin = await this.isConnected();

    // TODO: handshake should not handle login logic
    this.walletWindow?.postMessage(
      {
        type: 'mxDappConnect', // TODO: use const here
        payload: { queryString: payloadQueryString, isRelogin }
      },
      this.walletUrl
    );
    if (!isRelogin) {
      const {
        type: connectType,
        payload: { address, signature }
      } = await this.listenOnce();
      if (connectType !== 'connect') {
        throw new Error(
          `Could not connect. received ${connectType} event instead of connect`
        );
      }
      this.account.address = address;
      this.account.signature = signature;
    }

    this.handshakeEstablished = true;
    return true;
  }

  private async onHandshakeChangeListener() {
    const walletUrl = this.walletUrl;

    // TODO: use strong types here
    const handler = (event: MessageEvent) => {
      try {
        const { type, payload } = event.data;
        const isWalletEvent = event.origin === new URL(walletUrl).origin;

        if (isWalletEvent && type === 'handshake') {
          if (payload === false) {
            this.walletWindow?.close();
            this.handshakeEstablished = false;
            this.walletWindow = null;
            window.removeEventListener('message', handler);
          }
        }
      } catch {}
    };

    window.addEventListener('message', handler);
  }

  // TODO: remove any
  async listenOnce(): Promise<any> {
    if (!this.walletWindow) {
      throw new Error('Wallet window is not instantiated');
    }

    return await new Promise((resolve) => {
      const walletUrl = this.walletUrl;

      // TODO: change handler to relevant name if needed
      const handler = async (event: MessageEvent) => {
        try {
          const { type, payload } = event.data; // TODO: use strong types here
          const isWalletEvent = event.origin === new URL(walletUrl).origin;

          const isRelogin = await this.isConnected();

          if (isRelogin && type === 'connect' /* // TODO: use const here */) {
            return;
          }

          if (isWalletEvent) {
            window.removeEventListener('message', handler);
            resolve({ type, payload });
          }
        } catch {}
      };

      window.addEventListener('message', handler);
    });
  }

  async login(
    options: {
      callbackUrl?: string;
      token?: string;
    } = {}
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error(
        'Wallet cross window provider is not initialised, call init() first'
      );
    }
    this.callbackUrl = options.callbackUrl;
    this.accessToken = options.token;

    await this.handshake();

    return this.account.address; // TODO: whee is the signature ?
  }
  //----------------------------------------------------------------------------------------------------------------------------------

  static prepareWalletTransaction(
    transaction: Transaction
  ): IPlainTransactionObject {
    const plainTransaction = transaction.toPlainObject();

    const keysToTransform: Array<keyof typeof plainTransaction> = [
      'data',
      'receiverUsername',
      'senderUsername'
    ];

    keysToTransform.forEach((field) => {
      const currentField = plainTransaction[field];
      if (currentField) {
        (plainTransaction as any)[field] = Buffer.from(
          String(currentField)
        ).toString('base64');
      } else {
        (plainTransaction as any)[field] = '';
      }
    });

    return plainTransaction;
  }

  private buildTransactionsQueryString(transactions: Transaction[]): string {
    const jsonToSend: any = {};
    transactions.map((tx) => {
      const plainTx = CrossWindowProvider.prepareWalletTransaction(tx);
      for (const txProp in plainTx) {
        if (
          plainTx.hasOwnProperty(txProp) &&
          !jsonToSend.hasOwnProperty(txProp)
        ) {
          jsonToSend[txProp] = [];
        }

        const currentField = plainTx[txProp as keyof typeof plainTx];
        jsonToSend[txProp].push(currentField);
      }
    });

    return this.buildWalletQueryString({
      params: jsonToSend
    });
  }

  private buildWalletQueryString(options: { params?: any }): string {
    const callbackUrl = this.callbackUrl || window.location.href;
    const partialQueryString = qs.stringify(options.params || {});
    const fullQueryString = partialQueryString
      ? `${partialQueryString}&callbackUrl=${callbackUrl}`
      : `callbackUrl=${callbackUrl}`;

    return fullQueryString;
  }

  async logout(): Promise<boolean> {
    if (!this.initialized) {
      throw new Error(
        'CrossWindow provider is not initialised, call init() first'
      );
    }
    this.ensureConnected();
    await this.handshake();
    try {
      this.disconnect();
      this.walletWindow?.close();
    } catch (error) {
      console.warn('CrossWindow origin url is already cleared!', error);
    }

    return true;
  }

  private disconnect() {
    this.account = { address: '' };
  }

  async getAddress(): Promise<string> {
    if (!this.initialized) {
      throw new Error(
        'CrossWindow provider is not initialised, call init() first'
      );
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

    const payloadQueryString = this.buildTransactionsQueryString(transactions);
    this.walletWindow?.postMessage(
      { type: 'mxDappSignTransactions', payload: payloadQueryString },
      this.walletUrl
    );

    const { type, payload: signedPlainTransactions }: any =
      await this.listenOnce();

    if (type === 'cancel') {
      throw new Error('Transaction canceled.');
    }

    if (!signedPlainTransactions || !signedPlainTransactions.length) {
      throw new Error('Could not sign transactions');
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
    const payloadQueryString = this.buildWalletQueryString({
      params: {
        message: message.message.toString()
      }
    });
    this.walletWindow?.postMessage(
      { type: 'mxDappSignMessage', payload: payloadQueryString },
      this.walletUrl
    );
    const {
      type,
      payload: { status, signature }
    } = await this.listenOnce();
    if (type !== 'signMessage') {
      throw new Error(
        `Could not connect. received ${type} event instead of signMessage`
      );
    }

    if (status !== 'signed') {
      throw new Error('Could not sign message');
    }

    message.applySignature(Buffer.from(signature, 'hex'));

    return message;
  }

  cancelAction() {
    this.walletWindow?.postMessage(
      { type: 'mxDappCancelAction' },
      this.walletUrl
    );
  }
}
