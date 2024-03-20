var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getWalletWindowMock } from '../../test-utils';
import { CrossWindowProviderRequestEnums, CrossWindowProviderResponseEnums } from '../../types';
import { WindowManager } from '../../CrossWindowProvider/WindowManager';
describe('WindowManager', () => {
    let windowOpenSpy;
    let windowCloseSpy;
    let windowAddListenerSpy;
    let windowRemoveListenerSpy;
    let walletWindowMock;
    beforeEach(() => {
        walletWindowMock = getWalletWindowMock();
        windowAddListenerSpy = jest.spyOn(window, 'addEventListener');
        windowAddListenerSpy.mockImplementation(jest.fn());
        windowRemoveListenerSpy = jest.spyOn(window, 'removeEventListener');
        windowRemoveListenerSpy.mockImplementation(jest.fn());
        windowCloseSpy = jest.spyOn(window, 'close');
        windowCloseSpy.mockImplementation(jest.fn());
        windowOpenSpy = jest.spyOn(window, 'open');
        windowOpenSpy.mockImplementation(() => walletWindowMock);
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    it('should be a singleton instance', () => {
        const instance1 = WindowManager.getInstance();
        const instance2 = WindowManager.getInstance();
        expect(instance1).toBe(instance2);
    });
    it('should set wallet URL and initialize', () => __awaiter(void 0, void 0, void 0, function* () {
        const windowManager = WindowManager.getInstance();
        windowManager.setWalletUrl('https://wallet.example.com');
        yield windowManager.init();
        expect(windowManager.isInitialized()).toBeTruthy();
    }));
    it('should call init successfully correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const windowManager = WindowManager.getInstance();
        yield windowManager.init();
        expect(windowManager.isInitialized()).toBeTruthy();
    }));
    it('should call handshake successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const windowManager = WindowManager.getInstance();
        windowManager.handshake(CrossWindowProviderRequestEnums.loginRequest);
        expect(windowAddListenerSpy).toHaveBeenCalledTimes(1);
        expect(windowOpenSpy).toHaveBeenCalledTimes(1);
        expect(windowCloseSpy).toHaveBeenCalledTimes(0);
    }));
    it('should close connections correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const windowManager = WindowManager.getInstance();
        windowManager.closeConnection();
        expect(windowAddListenerSpy).toHaveBeenCalledTimes(1);
        expect(windowOpenSpy).toHaveBeenCalledTimes(1);
        expect(windowCloseSpy).toHaveBeenCalledTimes(0);
    }));
    it('should call add event listener successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const windowManager = WindowManager.getInstance();
        windowManager.listenOnce(CrossWindowProviderResponseEnums.loginResponse);
        expect(windowAddListenerSpy).toHaveBeenCalledTimes(1);
    }));
    it('should call postMessage successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const windowManager = WindowManager.getInstance();
        windowManager.postMessage({
            type: CrossWindowProviderRequestEnums.loginRequest,
            payload: {
                token: 'token'
            }
        });
        expect(windowAddListenerSpy).toHaveBeenCalledTimes(1);
        expect(windowOpenSpy).toHaveBeenCalledTimes(1);
        expect(windowCloseSpy).toHaveBeenCalledTimes(0);
    }));
});
//# sourceMappingURL=windowManager.test.js.map