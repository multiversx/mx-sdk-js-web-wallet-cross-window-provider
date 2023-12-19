import { WindowManager } from '../WindowManager';

describe('WindowManager', () => {
  let windowOpenSpy: jest.SpyInstance;
  let windowCloseSpy: jest.SpyInstance;
  let windowAddListenerSpy: jest.SpyInstance;
  let mockWalletWindow: { close: jest.Func; postMessage: jest.Func };

  beforeEach(() => {
    mockWalletWindow = { close: jest.fn(), postMessage: jest.fn() };

    windowAddListenerSpy = jest.spyOn(window, 'addEventListener');
    windowAddListenerSpy.mockImplementation(jest.fn());

    windowCloseSpy = jest.spyOn(window, 'close');
    windowCloseSpy.mockImplementation(jest.fn());

    windowOpenSpy = jest.spyOn(window, 'open');
    windowOpenSpy.mockImplementation(() => mockWalletWindow);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be a singleton instance', () => {
    const instance1 = WindowManager.getInstance();
    const instance2 = WindowManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should set wallet URL and initialize', async () => {
    const windowManager = WindowManager.getInstance();
    windowManager.setWalletUrl('https://wallet.example.com');
    await windowManager.init();
    expect(windowManager.isInitialized()).toBeTruthy();
  });

  it('should call init successfully correctly', async () => {
    const windowManager = WindowManager.getInstance();
    await windowManager.init();
    expect(windowManager.isInitialized()).toBeTruthy();
  });

  it('should call handshake successfully correctly', async () => {
    const windowManager = WindowManager.getInstance();
    windowManager.handshake();
    expect(windowAddListenerSpy).toHaveBeenCalledTimes(1);
    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    expect(windowCloseSpy).toHaveBeenCalledTimes(0);
  });

  it('should close connections correctly', async () => {
    const windowManager = WindowManager.getInstance();
    windowManager.closeConnection();
    expect(windowAddListenerSpy).toHaveBeenCalledTimes(1);
    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    expect(windowCloseSpy).toHaveBeenCalledTimes(0);
  });
});
