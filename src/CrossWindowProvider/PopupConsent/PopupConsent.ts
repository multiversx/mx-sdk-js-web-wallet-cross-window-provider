import { Element, element, attribute } from '@lume/element';
import { safeWindow } from '@multiversx/sdk-dapp-utils/out/constants/crossWindowProviderConstants';
import html from 'solid-js/html';
import { confirmationDialogTag } from './constants';
import { getStyles } from './getStyles';

@element(confirmationDialogTag)
export class PopupConsent extends Element {
  // eslint-disable-next-line
  // @ts-ignore
  @attribute id = '';

  // eslint-disable-next-line
  // @ts-ignore
  @attribute walletUrl = '';

  // eslint-disable-next-line
  // @ts-ignore
  @attribute onConfirm = () => {
    console.log('onConfirm');
  };

  // eslint-disable-next-line
  // @ts-ignore
  @attribute onCancel = () => {
    console.log('onCancel');
  };

  events = {
    confirm: `${this.id}-confirm`,
    cancel: `${this.id}-cancel`,
    mounted: `${this.id}-mounted`
  };

  firstUpdated() {
    this.dispatchAction(this.events.mounted);
  }

  dispatchAction = (type: string) => {
    const event = new CustomEvent(type, {
      bubbles: true, // Allow the event to bubble up through the DOM
      composed: true // Allow the event to cross the shadow DOM boundary
    });
    this.dispatchEvent(event);
  };

  handleConfirmEvent({ type }: CustomEvent) {
    switch (type) {
      case this.events.cancel:
        return this.onCancel();
      case this.events.confirm:
        return this.onConfirm();
      default:
        break;
    }
  }

  // no shadow-root
  createRenderRoot() {
    return this;
  }

  css = getStyles(this.id);

  template = () =>
    html`<div id="${this.id}">
      <div class="content">
        <div class="body">
          <div class="title">Confirm on MultiversX Wallet</div>
          <div class="subtitle">Continue to ${this.walletUrl}</div>
          <div class="actions-container">
            <button
              @click="${() => this.dispatchAction(this.events.cancel)}"
              class="button"
              data-testid="${this.events.cancel}-btn"
              id="${this.events.cancel}-btn"
            >
              Cancel
            </button>
            <button
              @click="${() => this.dispatchAction(this.events.confirm)}"
              class="button btn-proceed"
              data-testid="${this.events.confirm}-btn"
              id="${this.events.confirm}-btn"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>`;

  toggleEvents(action: 'removeEventListener' | 'addEventListener') {
    [this.events.cancel, this.events.confirm].forEach((event) => {
      this[action](event, this.handleConfirmEvent as EventListener);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.toggleEvents('addEventListener');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.toggleEvents('removeEventListener');
  }
}

const customElements = safeWindow?.customElements;
if (customElements && !customElements.get(confirmationDialogTag)) {
  customElements.define(confirmationDialogTag, PopupConsent);
}
