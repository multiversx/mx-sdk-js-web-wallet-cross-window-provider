import { SignableMessage, Transaction } from '@multiversx/sdk-core';
import { CrossWindowProviderRequestEnums } from '../types';
import { WindowManager } from './WindowManager';
export interface ICrossWindowWalletAccount {
    address: string;
    signature?: string;
    multisig?: string;
    impersonate?: string;
}
export declare class CrossWindowProvider {
    account: ICrossWindowWalletAccount;
    protected initialized: boolean;
    protected windowManager: WindowManager | null;
    protected static _instance: CrossWindowProvider | null;
    private accessToken;
    constructor();
    private ensureConnected;
    private disconnect;
    static getInstance(): CrossWindowProvider;
    setAddress(address: string): CrossWindowProvider;
    setWalletUrl(url: string): CrossWindowProvider;
    init(): Promise<boolean>;
    login(options?: {
        token?: string;
    }): Promise<ICrossWindowWalletAccount>;
    logout(): Promise<boolean>;
    getAddress(): Promise<string>;
    isInitialized(): boolean;
    isConnected(): Promise<boolean>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    guardTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: SignableMessage): Promise<SignableMessage>;
    cancelAction(): Promise<import("../types").PostMessageReturnType<CrossWindowProviderRequestEnums.cancelAction>>;
}
