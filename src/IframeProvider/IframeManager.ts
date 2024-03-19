import { defineCustomElements } from '@multiversx/sdk-dapp-core/loader';
import { WindowManager } from '../CrossWindowProvider/WindowManager';

export class IframeManager extends WindowManager {
  private floatingWalletComponent?: HTMLFloatingWalletElement = undefined;

  constructor() {
    super();
    defineCustomElements();
  }

  public get floatingWallet(): HTMLFloatingWalletElement | undefined {
    return this.floatingWalletComponent;
  }

  public static getInstance(): IframeManager {
    if (!IframeManager._instance) {
      return new IframeManager();
    }
    return IframeManager._instance;
  }

  public override async setWalletWindow(): Promise<void> {
    if (this.walletWindow) {
      return;
    }

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
    this.floatingWallet?.setWalletVisible(false);
  }
}
