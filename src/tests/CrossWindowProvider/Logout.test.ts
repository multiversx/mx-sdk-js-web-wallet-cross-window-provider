import { CrossWindowProvider } from '../../index';
import { WindowManager } from '../../WindowManager';

describe('CrossWindowProvider', () => {
  let crossWindowProvider: CrossWindowProvider;
  let mockWalletWindow: { close: jest.Func; postMessage: jest.Func };
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    mockWalletWindow = { close: jest.fn(), postMessage: jest.fn() };
    WindowManager.getInstance().postMessage = jest
      .fn()
      .mockImplementation(() => true);

    WindowManager.getInstance().closeConnection = jest
      .fn()
      .mockImplementation(() => true);

    crossWindowProvider = CrossWindowProvider.getInstance();

    // Mocking the WindowManager methods
    WindowManager.getInstance = jest.fn().mockReturnValue({
      init: jest.fn().mockResolvedValue(true),
      postMessage: jest.fn().mockResolvedValue({ payload: {} }),
      closeConnection: jest.fn().mockResolvedValue(true)
    });

    windowOpenSpy = jest.spyOn(window, 'open');
    windowOpenSpy.mockImplementation(() => mockWalletWindow);
  });

  it('should handle logout correctly', async () => {
    await crossWindowProvider.init();
    crossWindowProvider.setAddress('testAddress');
    const result = await crossWindowProvider.logout();
    expect(result).toBe(true);
  });
});
