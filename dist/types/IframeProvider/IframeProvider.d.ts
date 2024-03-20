import { CrossWindowProvider } from '../CrossWindowProvider';
export declare class IframeProvider extends CrossWindowProvider {
    init(): Promise<boolean>;
    static getInstance(): IframeProvider;
}
