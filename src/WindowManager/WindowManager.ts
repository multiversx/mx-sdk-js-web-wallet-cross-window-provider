import { responseTypeMap, safeWindow } from '../constants';
import {
  ErrCannotEstablishHandshake,
  ErrProviderNotInitialized,
  ErrWalletWindowNotInstantiated
} from '../errors';

import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums,
  PostMessageParamsType,
  PostMessageReturnType,
  ReplyWithPostMessageEventType,
  ReplyWithPostMessagePayloadType
} from '../types';

export class WindowManager {
  private walletUrl = '';
  private initialized = false;
  private static _instance: WindowManager = new WindowManager();
  walletWindow: Window | null = null;

  constructor() {
    window.addEventListener('beforeunload', () => {
      this.walletWindow?.close();
    });

    safeWindow.name = safeWindow.location?.origin;
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
    this.initialized = true;
    return this.initialized;
  }

  async handshake(type: CrossWindowProviderRequestEnums): Promise<boolean> {
    const isOpened =
      type === CrossWindowProviderRequestEnums.cancelAction &&
      Boolean(this.walletWindow);

    if (isOpened) {
      return true;
    }

    this.walletWindow?.close();
    this.walletWindow =
      safeWindow.open?.(this.walletUrl, this.walletUrl) ?? null;

    const { payload: isWalletReady } = await this.listenOnce(
      CrossWindowProviderResponseEnums.handshakeResponse
    );

    if (!isWalletReady) {
      throw new ErrCannotEstablishHandshake();
    }

    this.walletWindow?.postMessage(
      {
        type: CrossWindowProviderRequestEnums.finalizeHandshakeRequest
      },
      this.walletUrl
    );

    this.addHandshakeChangeListener();
    return true;
  }

  private async addHandshakeChangeListener() {
    const walletUrl = this.walletUrl;

    const eventHandler = (
      event: MessageEvent<ReplyWithPostMessageEventType>
    ) => {
      try {
        const { type, payload } = event.data;
        const isWalletEvent = event.origin === new URL(walletUrl).origin;

        if (!isWalletEvent) {
          return;
        }

        switch (type) {
          case CrossWindowProviderResponseEnums.handshakeResponse:
            if (payload === false) {
              this.walletWindow?.close();
              this.walletWindow = null;
              safeWindow.removeEventListener?.('message', eventHandler);
            }
            break;
        }
      } catch {}
    };

    safeWindow.addEventListener?.('message', eventHandler);
  }

  async listenOnce<T extends CrossWindowProviderResponseEnums>(
    action: T
  ): Promise<{
    type: T;
    payload: ReplyWithPostMessagePayloadType<T>;
  }> {
    if (!this.walletWindow) {
      throw new ErrWalletWindowNotInstantiated();
    }

    return await new Promise((resolve) => {
      const walletUrl = this.walletUrl;

      safeWindow.addEventListener?.(
        'message',
        async function eventHandler(
          event: MessageEvent<{
            type: T;
            payload: ReplyWithPostMessagePayloadType<T>;
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

          safeWindow.removeEventListener?.('message', eventHandler);
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
      payload: undefined
    });

    return true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async postMessage<T extends CrossWindowProviderRequestEnums>({
    type,
    payload
  }: PostMessageParamsType<T>): Promise<PostMessageReturnType<T>> {
    await this.handshake(type);

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
