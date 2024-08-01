export class IFrameProviderContentWindow {
  public iframe: HTMLIFrameElement;
  public contentWindow: Window | null;
  public walletAddress = '';

  private readonly container: HTMLDivElement;
  private readonly header: HTMLDivElement;
  private readonly body: HTMLDivElement;

  private readonly containerStyle = `
    width: 400px;
    height: 600px;
    border: 1px solid #0d0e10;
    border-radius: 5px;
    z-index: 9999;
    position: absolute;
    bottom: 0;
    right: 0;
    visibility: hidden;
  `;

  private readonly headerStyle = `
    color: #fff;
    background-color: #0d0e10;
    padding: 10px 15px;
    cursor: pointer;
    height: 50px;
  `;

  private readonly bodyStyle = `
    width: 100%;
    height: calc(100% - 40px);
    overflow: hidden;
  `;

  private readonly collapsibleButtonStyle = `
    width: 30px;
    height: 30px;
    cursor: pointer;
    margin: 0px;
    padding: 0px;
    box-sizing: content-box;
    font-family: sans-serif;
    text-align: center;
    font-size: 40px;
    line-height: 14px;
    border-width: 0px;
    border-radius: 2px;
    border-color: rgb(170, 170, 170);
    border-style: solid;
    background-color: transparent;
    color: gray;
    z-index: 50;
    user-select: none;
    float: right;
  `;

  private readonly closeWalletButtonStyle = `
    width: 30px;
    height: 30px;
    cursor: pointer;
    margin-top: 0px; 
    display: inline-block; 
    cursor: pointer;
    margin-top: 5px;
    padding: 0px;
    box-sizing: content-box;
    font-family: sans-serif;
    text-align: center;
    font-size: 30px;
    line-height: 14px;
    border-width: 0px;
    border-radius: 2px;
    border-color: rgb(170, 170, 170);
    border-style: solid;
    background-color: transparent;
    color: gray;
    z-index: 50;
    user-select: none;
    float: right;
  `;

  public constructor({
    id,
    url,
    anchor,
    onClose
  }: {
    id: string;
    url: string;
    anchor?: HTMLElement;
    onClose?: () => void;
  }) {
    this.container = document.createElement('div');
    this.header = document.createElement('div');
    this.body = document.createElement('div');
    // this.collapsibleButton = document.createElement("div");

    this.container.setAttribute('data-draggable', 'true');
    this.container.setAttribute('data-resizable', 'true');
    this.header.setAttribute('data-drag-handle', 'true');
    this.container.style.cssText = this.containerStyle;
    this.header.style.cssText = this.headerStyle;
    this.body.style.cssText = this.bodyStyle;

    const title = document.createElement('span');
    title.innerText = 'Wallet';
    this.header.appendChild(title);

    const collapsibleButton = document.createElement('span');
    collapsibleButton.id = 'iframe-toggle-button';
    collapsibleButton.innerText = '+';
    collapsibleButton.style.cssText = this.collapsibleButtonStyle;
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

    const closeWalletButton = document.createElement('span');
    closeWalletButton.id = 'iframe-close-button';
    closeWalletButton.innerText = '✖';
    closeWalletButton.style.cssText = this.closeWalletButtonStyle;
    closeWalletButton.onclick = () => {
      this.container.remove();
      onClose?.();
    };

    this.header.appendChild(closeWalletButton);
    this.header.appendChild(collapsibleButton);
    this.container.appendChild(this.header);
    this.container.appendChild(this.body);

    this.iframe = document.createElement('iframe');
    this.iframe.id = id;
    this.iframe.src = url;
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.border = 'none';
    this.iframe.style.borderRadius = '0 0 5px 5px';

    this.body.appendChild(this.iframe);

    this.contentWindow = this.iframe.contentWindow;

    this.iframe.onload = () => {
      this.contentWindow = this.iframe.contentWindow;

      const event = new CustomEvent('iframeWindowReady', {
        detail: this.iframe
      });

      this.iframe.dispatchEvent(event);
    };

    if (anchor) {
      anchor.appendChild(this.container);
    } else {
      document.body.appendChild(this.container);
    }

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

      // moves the ball at (pageX, pageY) coordinates
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
        window.getSelection()?.removeAllRanges();
      };

      // move the container on mousemove
      document.addEventListener('mousemove', onMouseMove);

      // drop the container, remove unneeded handlers
      this.container.onmouseup = () => {
        document.removeEventListener('mousemove', onMouseMove);
        this.container.onmouseup = null;
      };

      this.header.onmouseup = () => {
        document.removeEventListener('mousemove', onMouseMove);
        this.header.removeEventListener('mouseup', onMouseMove);
        this.header.onmouseup = null;
      };
    };
  }
}
