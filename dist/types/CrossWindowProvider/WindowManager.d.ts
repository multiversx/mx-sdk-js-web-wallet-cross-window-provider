import { CrossWindowProviderRequestEnums, CrossWindowProviderResponseEnums, PostMessageParamsType, PostMessageReturnType, ReplyWithPostMessagePayloadType } from '../types';
export declare class WindowManager {
    protected walletUrl: string;
    private initialized;
    protected static _instance: WindowManager | null;
    walletWindow: Window | null;
    constructor();
    static getInstance(): WindowManager;
    setWalletUrl(url: string): WindowManager;
    init(): Promise<boolean>;
    setWalletWindow(): Promise<void>;
    closeWalletWindow(): void;
    isWalletOpened(type?: CrossWindowProviderRequestEnums): boolean;
    handshake(type: CrossWindowProviderRequestEnums): Promise<boolean>;
    private addHandshakeChangeListener;
    listenOnce<T extends CrossWindowProviderResponseEnums>(action: T): Promise<{
        type: T;
        payload: ReplyWithPostMessagePayloadType<T>;
    }>;
    closeConnection(): Promise<boolean>;
    isInitialized(): boolean;
    postMessage<T extends CrossWindowProviderRequestEnums>({ type, payload }: PostMessageParamsType<T>): Promise<PostMessageReturnType<T>>;
}
