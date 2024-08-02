import {
  CrossWindowProvider,
  ICrossWindowWalletAccount
} from '../CrossWindowProvider';
import { ErrProviderNotInitialized } from '../errors';
import { IframeManager } from '../IFrameManager/IframeManager';

export class IframeProvider extends CrossWindowProvider {
  public constructor() {
    super();
    this.windowManager = new IframeManager({
      // TODO check why the logout is not sending logout request through postMessage
      onClose: this.logout.bind(this)
    });
  }

  public static getInstance(): IframeProvider {
    if (!IframeProvider._instance) {
      IframeProvider._instance = new IframeProvider();
      return IframeProvider._instance;
    }

    return IframeProvider._instance;
  }

  public override async init(): Promise<boolean> {
    const initialized = await super.init();
    await this.windowManager.setWalletWindow();

    return initialized;
  }

  public override async login(
    options: {
      token?: string;
    } = {}
  ): Promise<ICrossWindowWalletAccount> {
    const account = await super.login(options);
    await this.windowManager.setWalletWindow();

    return account;
  }

  public override async logout(): Promise<boolean> {
    if (!this.initialized) {
      throw new ErrProviderNotInitialized();
    }

    const connectionClosed = await this.windowManager.closeConnection();
    this.initialized = false;
    this.disconnect();

    return connectionClosed;
  }

  public override async openPopupConsent(): Promise<boolean> {
    return true;
  }
}
