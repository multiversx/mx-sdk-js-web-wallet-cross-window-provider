var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SignableMessage } from '@multiversx/sdk-core/out';
import { getWalletWindowMock, mockWindoManager } from '../../test-utils';
import { WindowManager } from '../WindowManager';
import { CrossWindowProvider } from '../CrossWindowProvider';
describe('CrossWindowProvider Login', () => {
    let crossWindowProvider;
    let walletWindowMock;
    let windowOpenSpy;
    beforeEach(() => {
        walletWindowMock = getWalletWindowMock();
        WindowManager.getInstance().postMessage = jest
            .fn()
            .mockImplementation(() => ({
            payload: {
                data: {
                    status: 'signed',
                    signature: Buffer.from('testSignature').toString('hex')
                }
            }
        }));
        crossWindowProvider = CrossWindowProvider.getInstance();
        mockWindoManager();
        windowOpenSpy = jest.spyOn(window, 'open');
        windowOpenSpy.mockImplementation(() => walletWindowMock);
    });
    it('should sign a message correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockMessage = new SignableMessage({ message: Buffer.from('test') });
        crossWindowProvider.setAddress('testAddress');
        yield crossWindowProvider.init();
        const result = yield crossWindowProvider.signMessage(mockMessage);
        expect(result.signature.toString()).toBe('testSignature');
    }));
});
//# sourceMappingURL=SignMessage.test.js.map