import { responseTypeMap } from '@multiversx/sdk-dapp-utils/out/constants/crossWindowProviderConstants';
import { CrossWindowProviderRequestEnums } from '@multiversx/sdk-dapp-utils/out/enums/crossWindowProviderEnums';
import {
  PostMessageParamsType,
  PostMessageReturnType
} from '@multiversx/sdk-dapp-utils/out/types/crossWindowProviderTypes';
import { safeDocument } from '../constants';
import { WindowManager } from '../WindowManager';
import { IFrameProviderContentWindow } from './IFrameProviderContentWindow';

export class IframeManager extends WindowManager {
  private floatingWalletComponent: IFrameProviderContentWindow | null = null;
  private readonly iframeId = 'floating-wallet';

  public get floatingWallet() {
    return this.floatingWalletComponent;
  }

  public override async postMessage<T extends CrossWindowProviderRequestEnums>({
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
    return data;
  }

  public override async closeConnection(): Promise<boolean> {
    const result = await super.closeConnection();
    this.floatingWalletComponent?.remove();
    this.walletWindow = null;
    return result;
  }

  public override isWalletOpened(): boolean {
    return Boolean(this.walletWindow);
  }

  public override closeWalletWindow(): void {
    if (!this.walletWindow) {
      return;
    }

    this.floatingWallet?.setWalletVisible(false);
  }

  public override async setWalletWindow(): Promise<void> {
    if (this.walletWindow) {
      this.floatingWallet?.setWalletVisible(true);
      return;
    }

    const anchor = safeDocument.getElementById?.('root');
    this.floatingWalletComponent = new IFrameProviderContentWindow({
      id: this.iframeId,
      anchor,
      url: this.walletUrl
    });
    this.floatingWalletComponent.walletAddress = this.walletUrl;

    const iframe = await new Promise(
      (resolve: (value?: HTMLIFrameElement) => void) => {
        this.floatingWalletComponent?.addEventListener(
          'iframeWindowReady',
          (event: Event & { detail?: HTMLIFrameElement }) => {
            resolve(event.detail);
          }
        );
      }
    );

    if (!iframe) {
      throw new Error('Cannot initialize iframe window');
    }

    this.walletWindow = iframe.contentWindow;
    this.setWalletVisible(true);
  }

  public setWalletVisible(visible: boolean): void {
    this.floatingWalletComponent?.setWalletVisible(visible);
  }
}
