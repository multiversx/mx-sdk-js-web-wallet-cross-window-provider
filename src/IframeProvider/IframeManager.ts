import { defineCustomElements } from '@multiversx/sdk-dapp-core/loader';
import { WindowManager } from '../CrossWindowProvider/WindowManager';

export class IframeManager extends WindowManager {
  private floatingWalletComponent?: HTMLFloatingWalletElement = undefined;

  constructor() {
    super();
    defineCustomElements();
  }

  public static getInstance(): IframeManager {
    if (!IframeManager._instance) {
      return new IframeManager();
    }
    return IframeManager._instance;
  }

  public override async setWalletWindow(): Promise<void> {
    this.floatingWalletComponent = document.createElement('floating-wallet');
    this.floatingWalletComponent.walletAddress = this.walletUrl;
    document.body.appendChild(this.floatingWalletComponent);
    const iframe: any = await new Promise((resolve) => {
      this.floatingWalletComponent?.addEventListener(
        'iframeWindowReady',
        (event) => {
          resolve(event.detail);
        }
      );
    });
    this.walletWindow = iframe.contentWindow;
  }
}
