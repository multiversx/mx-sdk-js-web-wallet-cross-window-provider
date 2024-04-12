import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { dialogId } from './constants';
import { getStyles } from './getStyles';

@customElement('popup-consent')
export class PopupConsent extends LitElement {
  @property({ type: String })
  id = dialogId;

  @property({ type: Boolean })
  shouldShow = true;

  @property({ type: String })
  walletUrl = '';

  @property({ type: Function })
  onConfirm = () => {};

  @property({ type: Function })
  onCancel = () => {};

  constructor() {
    super();
  }

  // no shadow-root
  createRenderRoot() {
    return this;
  }

  @property({ type: Function })
  getTemplate = () =>
    html` <style>
        ${getStyles(this.id)}
      </style>
      <div id="${dialogId}">
        <div class="content">
          <div class="body">
            <div class="title">Confirm on MultiversX Wallet</div>
            <div class="subtitle">Continue to ${this.walletUrl}</div>
            <div class="actions-container">
              <button @click="${this.onCancel}" class="button">Cancel</button>
              <button @click="${this.onConfirm}" class="button btn-proceed">
                Continue →
              </button>
            </div>
          </div>
        </div>
      </div>`;

  render() {
    return this.getTemplate();
  }
}
