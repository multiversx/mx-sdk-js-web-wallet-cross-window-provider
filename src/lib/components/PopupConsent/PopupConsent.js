"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupConsent = exports.confirmationDialogTag = void 0;
const crossWindowProviderConstants_1 = require("@multiversx/sdk-dapp-utils/out/constants/crossWindowProviderConstants");
const lit_1 = require("lit");
const decorators_js_1 = require("lit/decorators.js");
const getStyles_1 = require("./getStyles");
exports.confirmationDialogTag = 'mxcwp-confirmation-dialog';
class PopupConsent extends lit_1.LitElement {
    constructor() {
        super(...arguments);
        this.id = exports.confirmationDialogTag;
        this.walletUrl = '';
        this.onConfirm = () => {
            console.log('onConfirm');
        };
        this.onCancel = () => {
            console.log('onCancel');
        };
        this.events = {
            confirm: `${this.id}-confirm`,
            cancel: `${this.id}-cancel`,
            mounted: `${this.id}-mounted`
        };
        this.dispatchAction = (type) => {
            const event = new CustomEvent(type, {
                bubbles: true,
                composed: true // Allow the event to cross the shadow DOM boundary
            });
            this.dispatchEvent(event);
        };
        this.getTemplate = () => (0, lit_1.html) `<style>
        ${(0, getStyles_1.getStyles)(this.id)}
      </style>
      <div id="${this.id}">
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
    }
    firstUpdated() {
        this.dispatchAction(this.events.mounted);
    }
    handleConfirmEvent({ type }) {
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
    render() {
        return this.getTemplate();
    }
    toggleEvents(action) {
        [this.events.cancel, this.events.confirm].forEach((event) => {
            this[action](event, this.handleConfirmEvent);
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
__decorate([
    (0, decorators_js_1.property)({ type: String })
], PopupConsent.prototype, "id", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: String })
], PopupConsent.prototype, "walletUrl", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Function })
], PopupConsent.prototype, "onConfirm", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Function })
], PopupConsent.prototype, "onCancel", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Function })
], PopupConsent.prototype, "getTemplate", void 0);
exports.PopupConsent = PopupConsent;
const customElements = crossWindowProviderConstants_1.safeWindow === null || crossWindowProviderConstants_1.safeWindow === void 0 ? void 0 : crossWindowProviderConstants_1.safeWindow.customElements;
if (customElements && !customElements.get(exports.confirmationDialogTag)) {
    customElements.define(exports.confirmationDialogTag, PopupConsent);
}
//# sourceMappingURL=PopupConsent.js.map