import { CrossWindowProvider } from '../../CrossWindowProvider';
import {
  getWalletWindowMock,
  mockWindoManager,
  WalletWindowMockType
} from '../../test-utils';
import { WindowManager } from '../../WindowManager';

describe('CrossWindowProvider Login', () => {
  let crossWindowProvider: CrossWindowProvider;
  let walletWindowMock: WalletWindowMockType;
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    walletWindowMock = getWalletWindowMock();
    WindowManager.getInstance().postMessage = jest
      .fn()
      .mockImplementation(() => ({
        payload: {}
      }));

    crossWindowProvider = CrossWindowProvider.getInstance();
    mockWindoManager();
    windowOpenSpy = jest.spyOn(window, 'open');
    windowOpenSpy.mockImplementation(() => walletWindowMock);
  });

  it('should cancel an action correctly', async () => {
    await crossWindowProvider.init();
    const result = await crossWindowProvider.cancelAction();
    expect(result).toEqual({ payload: {} });
  });
});
