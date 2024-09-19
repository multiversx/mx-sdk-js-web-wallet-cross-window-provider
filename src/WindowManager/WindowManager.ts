import { safeWindow, responseTypeMap } from '../constants';
import {
  WindowProviderRequestEnums,
  WindowProviderResponseEnums
} from '../enums';
import {
  ErrCannotEstablishHandshake,
  ErrProviderNotInitialized,
  ErrProviderNotInstantiated
} from '../errors';
import {
  PostMessageParamsType,
  PostMessageReturnType,
  ReplyWithPostMessageEventType,
  ReplyWithPostMessagePayloadType
} from '../types';

export class WindowManager {
  private _walletUrl = '';
  protected initialized = false;
  public walletWindow: Window | null = null;

  constructor() {
    safeWindow.addEventListener?.('beforeunload', () => {
      this.closeWalletWindow();
    });

    safeWindow.name = safeWindow.location?.origin;
  }

  public get walletUrl(): string {
    return this._walletUrl;
  }

  public setWalletUrl(url: string): WindowManager {
    this._walletUrl = url;
    return this;
  }

  async init(): Promise<boolean> {
    this.initialized = typeof window !== 'undefined';
    return this.initialized;
  }

  public isWalletOpened(type?: WindowProviderRequestEnums) {
    return (
      type === WindowProviderRequestEnums.cancelAction &&
      Boolean(this.walletWindow)
    );
  }

  async handshake(type: WindowProviderRequestEnums): Promise<boolean> {
    const isOpened = this.isWalletOpened(type);
    if (isOpened) {
      return true;
    }

    this.closeWalletWindow();
    await this.setWalletWindow();

    const { payload: isWalletReady } = await this.listenOnce(
      WindowProviderResponseEnums.handshakeResponse
    );

    if (!isWalletReady) {
      throw new ErrCannotEstablishHandshake();
    }

    this.walletWindow?.postMessage(
      {
        type: WindowProviderRequestEnums.finalizeHandshakeRequest
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
          case WindowProviderResponseEnums.handshakeResponse:
            if (payload === false) {
              this.walletWindow?.close();
              this.walletWindow = null;
              safeWindow.removeEventListener?.('message', eventHandler);
            }
            break;
        }
      } catch (e) {
        console.error('Handshake response error', e);
      }
    };

    safeWindow.addEventListener?.('message', eventHandler);
  }

  async listenOnce<T extends WindowProviderResponseEnums>(
    action: T
  ): Promise<{
    type: T;
    payload: ReplyWithPostMessagePayloadType<T>;
  }> {
    if (!this.walletWindow) {
      throw new ErrProviderNotInstantiated();
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
            type === WindowProviderResponseEnums.cancelResponse;

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
      type: WindowProviderRequestEnums.logoutRequest,
      payload: undefined
    });

    return true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async postMessage<T extends WindowProviderRequestEnums>({
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

    this.closeWalletWindow();

    return data;
  }

  public closeWalletWindow() {
    this.walletWindow?.close();
  }

  public async setWalletWindow(): Promise<void> {
    this.walletWindow =
      safeWindow.open?.(this.walletUrl, this.walletUrl) ?? null;
  }
}
