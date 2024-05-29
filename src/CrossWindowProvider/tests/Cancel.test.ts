import { getWalletWindowMock, WalletWindowMockType } from '../../test-utils';
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
      .mockImplementation(() => undefined);

    WindowManager.getInstance().isWalletOpened = jest
      .fn()
      .mockImplementation(() => true);

    crossWindowProvider = CrossWindowProvider.getInstance();
    windowOpenSpy = jest.spyOn(window, 'open');
    windowOpenSpy.mockImplementation(() => walletWindowMock);
  });

  it('should cancel an action correctly', async () => {
    await crossWindowProvider.init();
    const result = await crossWindowProvider.cancelAction();
    expect(result).toBe(undefined);
  });
});
