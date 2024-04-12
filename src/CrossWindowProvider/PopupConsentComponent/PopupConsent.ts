import { LitElement, html, css } from 'lit';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { customElement } from 'lit/decorators.js';

@customElement('popup-consent')
export class PopupConsent extends LitElement {
  shouldShow = true;

  static styles = css`
    /* Add your component styles here */
  `;

  render() {
    if (!this.shouldShow) {
      return html``; // Don't render anything if shouldShow is false
    }

    return html`
      <div id="dialog">
        <!-- Your dialog content goes here -->
        <div>Hello from PopupConsent!</div>
        <button @click="${this.confirm}">Confirm</button>
        <button @click="${this.cancel}">Cancel</button>
      </div>
    `;
  }

  confirm() {
    // Handle confirm action
    this.dispatchEvent(new CustomEvent('confirm'));
  }

  cancel() {
    // Handle cancel action
    this.dispatchEvent(new CustomEvent('cancel'));
  }
}
