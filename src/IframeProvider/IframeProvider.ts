import {
  CrossWindowProvider,
  ICrossWindowWalletAccount
} from '../CrossWindowProvider';
import { IframeManager } from './IframeManager';

export class IframeProvider extends CrossWindowProvider {
  override async init(): Promise<boolean> {
    this.windowManager = IframeManager.getInstance();
    this.initialized = await this.windowManager.init();
    return this.initialized;
  }

  public static getInstance(): IframeProvider {
    if (!IframeProvider._instance) {
      return new IframeProvider();
    }
    return IframeProvider._instance;
  }
}
