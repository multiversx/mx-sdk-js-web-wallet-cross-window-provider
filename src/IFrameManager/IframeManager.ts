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
  private readonly onClose: (() => void) | undefined = undefined;

  constructor(props?: { onClose?: () => void }) {
    super();
    this.onClose = props?.onClose;
  }

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
      id: 'floating-wallet',
      anchor,
      url: this.walletUrl,
      onClose: () => {
        this.closeConnection();
        this.onClose?.();
      }
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
  }

  public setWalletVisible(visible: boolean): void {
    this.floatingWalletComponent?.setWalletVisible(visible);
  }
}
