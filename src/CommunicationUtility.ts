import { responseTypeMap } from './constants';
import {
  ErrCannotEstablishHandshake,
  ErrInstantiationFailed,
  ErrProviderNotInitialized,
  ErrWalletWindowNotInstantiated
} from './errors';

import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums,
  ReplyWithPostMessageType,
  ResponseTypeMap
} from './types';

export const DAPP_WINDOW_NAME = window.location.origin;

export class CommunicationUtility {
  private walletUrl = '';
  private initialized = false;
  private static _instance: CommunicationUtility = new CommunicationUtility();
  walletWindow: Window | null = null;

  public constructor() {
    if (CommunicationUtility._instance) {
      throw new ErrInstantiationFailed();
    }
    window.addEventListener('beforeunload', () => {
      this.walletWindow?.close();
    });

    window.name = window.name = DAPP_WINDOW_NAME;
    CommunicationUtility._instance = this;
  }

  public static getInstance(): CommunicationUtility {
    return CommunicationUtility._instance;
  }

  public setWalletUrl(url: string): CommunicationUtility {
    this.walletUrl = url;
    return CommunicationUtility._instance;
  }

  async init(): Promise<boolean> {
    window.name = DAPP_WINDOW_NAME;
    this.initialized = true;
    return this.initialized;
  }

  async handshake(): Promise<boolean> {
    this.walletWindow?.close();
    this.walletWindow = window.open(this.walletUrl, this.walletUrl);
    const { payload } = await this.listenOnce(
      CrossWindowProviderResponseEnums.handshakeResponse
    );

    if (!payload) {
      throw new ErrCannotEstablishHandshake();
    }
    this.addHandshakeChangeListener();

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

        if (
          isWalletEvent &&
          type === CrossWindowProviderResponseEnums.handshakeResponse
        ) {
          if (payload === false) {
            self.walletWindow?.close();
            self.walletWindow = null;
            window.removeEventListener('message', eventHandler);
          }
        }
      } catch {}
    });
  }

  async listenOnce<T extends CrossWindowProviderResponseEnums>(
    action: T
  ): Promise<{
    type: T;
    payload: ReplyWithPostMessageType<T>['payload'];
  }> {
    if (!this.walletWindow) {
      throw new ErrWalletWindowNotInstantiated();
    }

    return await new Promise((resolve) => {
      const walletUrl = this.walletUrl;

      window.addEventListener(
        'message',
        async function eventHandler(
          event: MessageEvent<{
            type: T;
            payload: ReplyWithPostMessageType<T>['payload'];
          }>
        ) {
          const { type, payload } = event.data;

          const isWalletEvent = event.origin === new URL(walletUrl).origin;

          const isCurrentAction =
            action === type ||
            type === CrossWindowProviderResponseEnums.cancelResponse; // TODO: check if this is needed

          if (!isCurrentAction) {
            return;
          }

          if (isWalletEvent) {
            window.removeEventListener('message', eventHandler);
            resolve({ type, payload });
          }
        }
      );
    });
  }

  async connectWallet(payloadQueryString: string) {
    this.walletWindow?.postMessage(
      {
        type: CrossWindowProviderRequestEnums.loginRequest,
        payload: { queryString: payloadQueryString }
      },
      this.walletUrl
    );
  }

  async close(): Promise<boolean> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }
    await this.handshake();
    this.walletWindow?.close();

    return true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async postMessage<T extends CrossWindowProviderRequestEnums>({
    type,
    payload
  }: {
    type: T;
    payload: string;
  }): Promise<{
    type: ResponseTypeMap[T];
    payload: ReplyWithPostMessageType<ResponseTypeMap[T]>['payload'];
  }> {
    await this.handshake();

    this.walletWindow?.postMessage(
      {
        type,
        payload
      },
      this.walletUrl
    );

    const data = await this.listenOnce(responseTypeMap[type]);

    this.walletWindow?.close();

    return data;
  }
}
