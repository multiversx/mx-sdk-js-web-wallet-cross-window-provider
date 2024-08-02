import { safeDocument, safeWindow } from '../constants';
import {
  bodyStyle,
  closeWalletButtonStyle,
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

  private readonly onClose: (() => void) | undefined = undefined;

  public constructor(props: {
    id: string;
    url: string;
    anchor?: HTMLElement;
    onClose?: () => void;
  }) {
    const { id, url, anchor, onClose } = props;

    this.onClose = onClose;

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
    this.container.setAttribute('data-draggable', 'true');
    this.container.setAttribute('data-resizable', 'true');
    this.header.setAttribute('data-drag-handle', 'true');
    this.container.style.cssText = containerStyle;
    this.header.style.cssText = headerStyle;
    this.body.style.cssText = bodyStyle;

    const { collapsibleButton, closeWalletButton } = this.getHeaderButtons();

    this.header.appendChild(closeWalletButton);
    this.header.appendChild(collapsibleButton);
    this.container.appendChild(this.header);
    this.container.appendChild(this.body);

    this.iframe.id = id;
    this.iframe.src = url;
    this.iframe.style.cssText = iframeStyle;

    this.body.appendChild(this.iframe);
  }

  private getHeaderButtons() {
    const title = safeDocument.createElement?.('span');
    title.innerText = 'Wallet';
    this.header.appendChild(title);

    const collapsibleButton = safeDocument.createElement?.('span');
    collapsibleButton.id = 'iframe-toggle-button';
    collapsibleButton.innerText = '+';
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

    const closeWalletButton = safeDocument.createElement?.('span');
    closeWalletButton.id = 'iframe-close-button';
    closeWalletButton.innerText = '✖';
    closeWalletButton.style.cssText = closeWalletButtonStyle;
    closeWalletButton.onclick = () => {
      this.container.remove();
      this.onClose?.();
    };
    return { collapsibleButton, closeWalletButton };
  }

  private setupWindow() {
    this.iframe.onload = () => {
      this.contentWindow = this.iframe.contentWindow;

      const event = new CustomEvent('iframeWindowReady', {
        detail: this.iframe
      });

      this.iframe.dispatchEvent(event);
    };

    this.setupResizable();
    this.setupDraggable();
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

  private setupResizable() {
    this.container.style.setProperty('resize', 'both');
    this.container.style.setProperty('overflow', 'hidden');
  }

  private setupDraggable() {
    this.container.ondragstart = () => {
      return false;
    };

    this.header.onmousedown = (event) => {
      const shiftX =
        event.clientX - this.container.getBoundingClientRect().left;
      const shiftY = event.clientY - this.container.getBoundingClientRect().top;

      // moves the window at (pageX, pageY) coordinates
      // taking initial shifts into account
      const moveAt = (pageX: number, pageY: number) => {
        this.container.style.left = pageX - shiftX + 'px';
        this.container.style.top = pageY - shiftY + 'px';
      };

      this.container.style.position = 'absolute';
      this.container.style.zIndex = '1000';

      moveAt(event.pageX, event.pageY);

      const onMouseMove = (ev: MouseEvent) => {
        moveAt(ev.pageX, ev.pageY);
        safeWindow.getSelection?.()?.removeAllRanges();
      };

      // move the container on mousemove
      safeDocument.addEventListener?.('mousemove', onMouseMove);

      // drop the container, remove unneeded handlers
      this.container.onmouseup = () => {
        safeDocument.removeEventListener?.('mousemove', onMouseMove);
        this.container.onmouseup = null;
      };

      // drop the header, remove unneeded handlers
      this.header.onmouseup = () => {
        safeDocument.removeEventListener?.('mousemove', onMouseMove);
        this.header.removeEventListener('mouseup', onMouseMove);
        this.header.onmouseup = null;
      };
    };
  }
}
