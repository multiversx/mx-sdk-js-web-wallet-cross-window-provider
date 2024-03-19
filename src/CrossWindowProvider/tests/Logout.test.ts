import {
  getWalletWindowMock,
  mockWindoManager,
  WalletWindowMockType
} from '../../test-utils';
import { WindowManager } from '../WindowManager';
import { CrossWindowProvider } from '../CrossWindowProvider';

describe('CrossWindowProvider', () => {
  let crossWindowProvider: CrossWindowProvider;
  let walletWindowMock: WalletWindowMockType;
  let windowOpenSpy: jest.SpyInstance;

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

  it('should handle logout correctly', async () => {
    await crossWindowProvider.init();
    crossWindowProvider.setAddress('testAddress');
    const result = await crossWindowProvider.logout();
    expect(result).toBe(true);
  });
});
