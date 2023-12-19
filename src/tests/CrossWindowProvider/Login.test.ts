import { CrossWindowProvider } from '../../index';
import { WindowManager } from '../../WindowManager';

describe('CrossWindowProvider Login', () => {
  let crossWindowProvider: CrossWindowProvider;
  let mockWalletWindow: { close: jest.Func; postMessage: jest.Func };
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    mockWalletWindow = { close: jest.fn(), postMessage: jest.fn() };
    WindowManager.getInstance().postMessage = jest
      .fn()
      .mockImplementation(() => ({
        payload: {
          data: { address: 'testAddress', signature: 'testSignature' }
        }
      }));

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

  it('should handle login correctly', async () => {
    await crossWindowProvider.init();
    const result = await crossWindowProvider.login({ token: 'testToken' });
    expect(result).toEqual({
      address: 'testAddress',
      signature: 'testSignature'
    });
  });
});
