import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './styles';

@customElement('popup-consent')
export class PopupConsent extends LitElement {
  @property({ type: Boolean })
  shouldShow = true;

  @property({ type: String })
  walletUrl = '';

  @property({ type: Function })
  onConfirm = () => {};

  @property({ type: Function })
  onCancel = () => {};

  static styles = styles;

  // no shadow-root
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="content">
        <div class="body">
          <div class="title">Confirm on MultiversX Wallet</div>
          <div class="subtitle">Continue to ${this.walletUrl}</div>

          <div class="actions-container">
            <button @click="${this.onCancel}" class="button">Cancel</button>
            <button @click="${this.onCancel}" class="button btn-proceed">
              Continue →
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
