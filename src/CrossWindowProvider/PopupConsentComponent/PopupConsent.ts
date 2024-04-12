import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getStyles } from './getStyles';

@customElement('popup-consent')
export class PopupConsent extends LitElement {
  @property({ type: String })
  id = 'mxcwp_confirmation-dialog';

  @property({ type: String })
  walletUrl = '';

  @property({ type: Function })
  onConfirm = () => {};

  @property({ type: Function })
  onCancel = () => {};

  constructor() {
    super();
  }

  dispatchAction = (action: boolean) => () => {
    const event = new CustomEvent(`${this.id}-event`, {
      bubbles: true, // Allow the event to bubble up through the DOM
      composed: true, // Allow the event to cross the shadow DOM boundary
      detail: { message: action }
    });
    this.dispatchEvent(event);
  };

  handleConfirmEvent({
    detail: { message: isConfirmed }
  }: CustomEvent<{
    message: boolean;
  }>) {
    return isConfirmed ? this.onConfirm() : this.onCancel();
  }

  // no shadow-root
  createRenderRoot() {
    return this;
  }

  @property({ type: Function })
  getTemplate = () =>
    html`<style>
        ${getStyles(this.id)}
      </style>
      <div id="${this.id}">
        <div class="content">
          <div class="body">
            <div class="title">Confirm on MultiversX Wallet</div>
            <div class="subtitle">Continue to ${this.walletUrl}</div>
            <div class="actions-container">
              <button @click="${this.dispatchAction(false)}" class="button">
                Cancel
              </button>
              <button
                @click="${this.dispatchAction(true)}"
                class="button btn-proceed"
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      </div>`;

  render() {
    return this.getTemplate();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      `${this.id}-event`,
      this.handleConfirmEvent as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      `${this.id}-event`,
      this.handleConfirmEvent as EventListener
    );
  }
}
