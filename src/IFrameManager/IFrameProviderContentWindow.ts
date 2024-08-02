import { safeDocument } from '../constants';
import {
  bodyStyle,
  collapsibleButtonStyle,
  containerStyle,
  headerStyle,
  iframeStyle
} from './iframeManager.styles';

export class IFrameProviderContentWindow {
  public iframe: HTMLIFrameElement;
  public contentWindow: Window | null;
  public walletAddress = '';

  private readonly container: HTMLDivElement;
  private readonly header: HTMLDivElement;
  private readonly body: HTMLDivElement;

  public constructor(props: { id: string; url: string; anchor?: HTMLElement }) {
    const { id, url, anchor } = props;

    this.container = safeDocument.createElement?.('div');
    this.header = safeDocument.createElement?.('div');
    this.body = safeDocument.createElement?.('div');
    this.iframe = safeDocument.createElement?.('iframe');

    this.buildWindow(id, url);
    this.contentWindow = this.iframe.contentWindow;
    this.setupWindow();

    if (anchor) {
      anchor.appendChild(this.container);
    } else {
      safeDocument.body?.appendChild?.(this.container);
    }
  }

  private buildWindow(id: string, url: string) {
    this.container.id = `window-container-${id}`;
    this.iframe.id = id;
    this.iframe.src = url;

    this.container.style.cssText = containerStyle;
    this.header.style.cssText = headerStyle;
    this.body.style.cssText = bodyStyle;
    this.iframe.style.cssText = iframeStyle;

    this.buildContainer();
  }

  private buildHeader() {
    const title = safeDocument.createElement?.('span');
    title.innerText = 'Wallet';
    this.header.appendChild(title);

    const collapsibleButton = safeDocument.createElement?.('span');
    collapsibleButton.id = 'iframe-toggle-button';
    collapsibleButton.innerText = '-';
    collapsibleButton.style.cssText = collapsibleButtonStyle;
    collapsibleButton.onclick = () => {
      this.body.style.visibility =
        this.body.style.visibility === 'hidden' ? 'visible' : 'hidden';
      this.container.style.height =
        this.body.style.visibility === 'hidden' ? '50px' : '600px';
      collapsibleButton.innerText =
        this.body.style.visibility === 'hidden' ? '+' : '-';
      this.container.style.setProperty(
        'resize',
        this.body.style.visibility === 'hidden' ? 'none' : 'both'
      );
    };
    this.header.appendChild(collapsibleButton);
  }

  private buildContainer() {
    this.container.appendChild(this.header);
    this.container.appendChild(this.body);
    this.body.appendChild(this.iframe);
    this.buildHeader();
  }

  private setupWindow() {
    this.iframe.onload = () => {
      this.contentWindow = this.iframe.contentWindow;

      const event = new CustomEvent('iframeWindowReady', {
        detail: this.iframe
      });

      this.iframe.dispatchEvent(event);
    };
  }

  public getContainer(): HTMLDivElement {
    return this.container;
  }

  public getIframe(): HTMLIFrameElement {
    return this.iframe;
  }

  public getContentWindow(): Window | null {
    return this.contentWindow;
  }

  public setUrl(url: string): void {
    this.iframe.setAttribute('src', url);
  }

  public remove(): void {
    this.container.remove();
  }

  public setWalletVisible(visible: boolean): void {
    this.container.style.visibility = visible ? 'visible' : 'hidden';
  }

  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    this.iframe.addEventListener(type, listener);
  }
}
