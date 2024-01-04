import {
  getWalletWindowMock,
  mockWindoManager,
  WalletWindowMockType
} from '../../test-utils';
import { WindowManager } from '../../WindowManager/WindowManager';
import { CrossWindowProvider } from '../CrossWindowProvider';

describe('CrossWindowProvider Login', () => {
  let crossWindowProvider: CrossWindowProvider;
  let walletWindowMock: WalletWindowMockType;
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    walletWindowMock = getWalletWindowMock();
    WindowManager.getInstance().postMessage = jest
      .fn()
      .mockImplementation(() => ({
        payload: {
          data: { address: 'testAddress', signature: 'testSignature' }
        }
      }));

    crossWindowProvider = CrossWindowProvider.getInstance();
    mockWindoManager();
    windowOpenSpy = jest.spyOn(window, 'open');
    windowOpenSpy.mockImplementation(() => walletWindowMock);
  });

  it('should handle login correctly', async () => {
    await crossWindowProvider.init();
    const result = await crossWindowProvider.login({ token: 'testToken' });
    expect(result).toEqual({
      address: 'testAddress',
      signature: 'testSignature'
    });
  });
});
