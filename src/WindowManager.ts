import { DAPP_WINDOW_NAME, responseTypeMap } from './constants';
import {
  ErrCannotEstablishHandshake,
  ErrProviderNotInitialized,
  ErrWalletWindowNotInstantiated
} from './errors';

import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums,
  ReplyWithPostMessageType,
  ResponseTypeMap
} from './types';

export class WindowManager {
  private walletUrl = '';
  private initialized = false;
  private static _instance: WindowManager = new WindowManager();
  walletWindow: Window | null = null;

  constructor() {
    window.addEventListener('beforeunload', () => {
      this.walletWindow?.close();
    });

    window.name = window.name = DAPP_WINDOW_NAME;
    WindowManager._instance = this; // TODO: remove singleton
  }

  public static getInstance(): WindowManager {
    return WindowManager._instance;
  }

  public setWalletUrl(url: string): WindowManager {
    this.walletUrl = url;
    return WindowManager._instance;
  }

  async init(): Promise<boolean> {
    window.name = DAPP_WINDOW_NAME;
    this.initialized = true;
    return this.initialized;
  }

  async handshake(): Promise<boolean> {
    this.walletWindow?.close();
    this.walletWindow = window.open(this.walletUrl, this.walletUrl);

    const { payload: isWalletReady } = await this.listenOnce(
      CrossWindowProviderResponseEnums.handshakeResponse
    );

    if (!isWalletReady) {
      throw new ErrCannotEstablishHandshake();
    }

    this.walletWindow?.postMessage(
      {
        type: CrossWindowProviderRequestEnums.finalizeHandshakeRequest,
        payload: DAPP_WINDOW_NAME
      },
      this.walletUrl
    );

    this.addHandshakeChangeListener();
    return true;
  }

  private async addHandshakeChangeListener() {
    const walletUrl = this.walletUrl;

    // TODO: check any
    const eventHandler = (event: MessageEvent<any>) => {
      try {
        const { type, payload } = event.data;
        const isWalletEvent = event.origin === new URL(walletUrl).origin;

        const shouldCloseWindow =
          isWalletEvent &&
          type === CrossWindowProviderResponseEnums.handshakeResponse &&
          payload === false;

        if (!shouldCloseWindow) {
          return;
        }

        this.walletWindow?.close();
        this.walletWindow = null;
        window.removeEventListener('message', eventHandler);
      } catch {}
    };

    window.addEventListener('message', eventHandler);
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
            type === CrossWindowProviderResponseEnums.cancelResponse;

          if (!isCurrentAction || !isWalletEvent) {
            return;
          }

          window.removeEventListener('message', eventHandler);
          resolve({ type, payload });
        }
      );
    });
  }

  async closeConnection(): Promise<boolean> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }

    await this.postMessage({
      type: CrossWindowProviderRequestEnums.logoutRequest,
      payload: ''
    });

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
    type: ResponseTypeMap[T] | CrossWindowProviderResponseEnums.cancelResponse;
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
