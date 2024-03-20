var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getWalletWindowMock, mockWindoManager } from '../../test-utils';
import { WindowManager } from '../WindowManager';
import { CrossWindowProvider } from '../CrossWindowProvider';
describe('CrossWindowProvider', () => {
    let crossWindowProvider;
    let walletWindowMock;
    let windowOpenSpy;
    beforeEach(() => {
        walletWindowMock = getWalletWindowMock();
        WindowManager.getInstance().postMessage = jest
            .fn()
            .mockImplementation(() => true);
        WindowManager.getInstance().closeConnection = jest
            .fn()
            .mockImplementation(() => true);
        crossWindowProvider = CrossWindowProvider.getInstance();
        mockWindoManager();
        windowOpenSpy = jest.spyOn(window, 'open');
        windowOpenSpy.mockImplementation(() => walletWindowMock);
    });
    it('should handle logout correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        yield crossWindowProvider.init();
        crossWindowProvider.setAddress('testAddress');
        const result = yield crossWindowProvider.logout();
        expect(result).toBe(true);
    }));
});
//# sourceMappingURL=Logout.test.js.map