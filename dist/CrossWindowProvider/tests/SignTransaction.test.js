var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createMockTransaction, getWalletWindowMock, mockWindoManager } from '../../test-utils';
import { WindowManager } from '../WindowManager';
import { CrossWindowProvider } from '../CrossWindowProvider';
describe('CrossWindowProvider Login', () => {
    let crossWindowProvider;
    let walletWindowMock;
    let windowOpenSpy;
    let mockTransaction;
    beforeEach(() => {
        walletWindowMock = getWalletWindowMock();
        mockTransaction = createMockTransaction({
            data: 'data',
            receiverUsername: 'receiver',
            senderUsername: 'sender'
        });
        WindowManager.getInstance().postMessage = jest
            .fn()
            .mockImplementation(() => ({
            payload: { data: [mockTransaction.toPlainObject()] }
        }));
        crossWindowProvider = CrossWindowProvider.getInstance();
        mockWindoManager();
        windowOpenSpy = jest.spyOn(window, 'open');
        windowOpenSpy.mockImplementation(() => walletWindowMock);
    });
    it('should sign a transaction correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        crossWindowProvider.setAddress('testAddress');
        yield crossWindowProvider.init();
        const result = yield crossWindowProvider.signTransaction(mockTransaction);
        expect(result).toStrictEqual(mockTransaction);
    }));
});
//# sourceMappingURL=SignTransaction.test.js.map