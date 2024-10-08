export interface PopupConsentModel {
  walletUrl: string;
  identifier: string;
  events: {
    confirm: string;
    cancel: string;
    mounted: string;
  };

  onCancel: () => void;
  onConfirm: () => void;

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void;
  render(): void;
  toggleEvents(action: 'removeEventListener' | 'addEventListener'): void;
  connectedCallback(): void;
  disconnectedCallback(): void;
}
