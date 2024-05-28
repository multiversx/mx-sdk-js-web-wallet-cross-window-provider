import { LitElement } from 'lit';
export declare const confirmationDialogTag = "mxcwp-confirmation-dialog";
export declare class PopupConsent extends LitElement {
    id: string;
    walletUrl: string;
    onConfirm: () => void;
    onCancel: () => void;
    events: {
        confirm: string;
        cancel: string;
        mounted: string;
    };
    firstUpdated(): void;
    dispatchAction: (type: string) => void;
    handleConfirmEvent({ type }: CustomEvent): void;
    createRenderRoot(): this;
    getTemplate: () => import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
    toggleEvents(action: 'removeEventListener' | 'addEventListener'): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
}
