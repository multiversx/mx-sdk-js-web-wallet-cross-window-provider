import { SignableMessage, Transaction } from '@multiversx/sdk-core';
import {
  ErrAccountNotConnected,
  ErrCannotSignSingleTransaction
} from './errors';
import {
  buildTransactionsQueryString,
  buildWalletQueryString
} from './helpers';

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
      console.log('In HANDSHAKE: ', 'opening new wallet window');
      this.walletWindow = window.open(this.walletUrl, this.walletUrl);
    } else {
      console.log('In HANDSHAKE: ', 'opening Existing window');
      window.open('', this.walletUrl); // TODO: since walletWindow is always closed, is this needed?
    }

    // TODO: is this needed?
    if (this.handshakeEstablished) {
      console.log(
        'In HANDSHAKE: ',
        'handshakeEstablished',
        this.handshakeEstablished
      );
      return true;
    }

    console.log(
      'In HANDSHAKE: ',
      'start listening for handshake event from wallet'
    );

    const { type, payload } = await this.listenOnce();
    if (type !== 'handshake' || !payload) {
      throw new Error('Handshake could not be established');
    }

    console.log('In HANDSHAKE: ', 'Listen once event received: ', {
      type,
      payload
    });

    this.walletWindow?.postMessage(
      { type: 'mxDappHandshake', payload: true },
      this.walletUrl
    );
    this.onHandshakeChangeListener();

    const payloadQueryString = buildWalletQueryString({
      params: {
        token: this.accessToken
      }
    });
    const isRelogin = await this.isConnected();

    console.log('In HANDSHAKE: ', 'Posting mxDappHandshake `true` to wallet', {
      isRelogin
    });

    // TODO: handshake should not handle login logic
    this.walletWindow?.postMessage(
      {
        type: 'mxDappConnect', // TODO: use const here
        payload: { queryString: payloadQueryString, isRelogin }
      },
      this.walletUrl
    );

    console.log(
      'In HANDSHAKE: ',
      'Posting mxDappConnect connect intent to wallet',
      {
        type: 'mxDappConnect', // TODO: use const here
        payload: { queryString: payloadQueryString, isRelogin }
      }
    );

    if (!isRelogin) {
      console.log('In HANDSHAKE: ', 'Waiting for connect event from wallet  ');

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
      console.log('In HANDSHAKE: ', 'Is first login', {
        address,
        signature
      });
    }

    console.log('In HANDSHAKE: ', 'handshakeEstablished done');

    this.handshakeEstablished = true;
    return true;
  }

  private async onHandshakeChangeListener() {
    console.log('add handshake change listener');
    const walletUrl = this.walletUrl;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    window.addEventListener('message', function eventHandler(event) {
      try {
        const { type, payload } = event.data;
        const isWalletEvent = event.origin === new URL(walletUrl).origin;

        if (isWalletEvent && type === 'handshake') {
          console.log('handshake changed! ', payload);
          if (payload === false) {
            self.walletWindow?.close();
            self.handshakeEstablished = false;
            self.walletWindow = null;
            console.log('remove handshake!!@#s');
            window.removeEventListener('message', eventHandler);
          }
        }
      } catch {}
    });
  }

  // TODO: remove any
  //param for specific action to listen to
  async listenOnce(): Promise<any> {
    if (!this.walletWindow) {
      throw new Error('Wallet window is not instantiated');
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    return await new Promise((resolve) => {
      const walletUrl = this.walletUrl;
      window.addEventListener('message', async function eventHandler(event) {
        try {
          const { type, payload } = event.data;
          const isWalletEvent = event.origin === new URL(walletUrl).origin;

          const isRelogin = await self.isConnected();
          if (isRelogin && type === 'connect') {
            return;
          }

          if (isWalletEvent) {
            window.removeEventListener('message', eventHandler);
            resolve({ type, payload });
          }
        } catch {}
      });
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

    this.walletWindow?.close();

    return this.account.address; // TODO: whee is the signature ?
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

    const payloadQueryString = buildTransactionsQueryString(transactions);
    this.walletWindow?.postMessage(
      { type: 'mxDappSignTransactions', payload: payloadQueryString },
      this.walletUrl
    );

    const { type, payload: signedPlainTransactions }: any =
      await this.listenOnce();

    this.walletWindow?.close();

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
    const payloadQueryString = buildWalletQueryString({
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

    this.walletWindow?.close();

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
