import { CrossWindowProvider } from '../../index';
import { mockWindoManager } from '../../test-utils';
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
        payload: {}
      }));

    crossWindowProvider = CrossWindowProvider.getInstance();

    mockWindoManager();

    windowOpenSpy = jest.spyOn(window, 'open');
    windowOpenSpy.mockImplementation(() => mockWalletWindow);
  });

  it('should cancel an action correctly', async () => {
    await crossWindowProvider.init();
    const result = await crossWindowProvider.cancelAction();
    expect(result).toEqual({ payload: {} });
  });
});
