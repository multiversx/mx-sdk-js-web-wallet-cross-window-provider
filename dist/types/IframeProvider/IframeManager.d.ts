import { WindowManager } from '../CrossWindowProvider/WindowManager';
export declare class IframeManager extends WindowManager {
    private floatingWalletComponent?;
    constructor();
    get floatingWallet(): HTMLFloatingWalletElement | undefined;
    static getInstance(): IframeManager;
    setWalletWindow(): Promise<void>;
    closeConnection(): Promise<boolean>;
    isWalletOpened(): boolean;
    closeWalletWindow(): void;
}
