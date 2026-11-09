import {
  WindowProviderRequestEnums,
  WindowProviderResponseEnums
} from '../../enums';
import { getWalletWindowMock } from '../../test-utils';
import { WindowManager } from '../WindowManager';

describe('WindowManager', () => {
  let windowOpenSpy: jest.SpyInstance;
  let windowCloseSpy: jest.SpyInstance;
  let windowAddListenerSpy: jest.SpyInstance;
  let windowRemoveListenerSpy: jest.SpyInstance;
  let walletWindowMock: { close: jest.Func; postMessage: jest.Func };

  beforeEach(() => {
    walletWindowMock = getWalletWindowMock();

    windowAddListenerSpy = jest.spyOn(window, 'addEventListener');
    windowAddListenerSpy.mockImplementation(jest.fn());

    windowRemoveListenerSpy = jest.spyOn(window, 'removeEventListener');
    windowRemoveListenerSpy.mockImplementation(jest.fn());

    windowCloseSpy = jest.spyOn(window, 'close');
    windowCloseSpy.mockImplementation(jest.fn());

    windowOpenSpy = jest.spyOn(window, 'open');
    windowOpenSpy.mockImplementation(() => walletWindowMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should set wallet URL and initialize', async () => {
    const windowManager = new WindowManager();
    windowManager.setWalletUrl('https://wallet.example.com');
    await windowManager.init();
    expect(windowManager.isInitialized()).toBeTruthy();
  });

  it('should call init successfully correctly', async () => {
    const windowManager = new WindowManager();
    await windowManager.init();
    expect(windowManager.isInitialized()).toBeTruthy();
  });

  it('should call handshake successfully', async () => {
    const windowManager = new WindowManager();
    windowManager.handshake(WindowProviderRequestEnums.loginRequest);
    expect(windowAddListenerSpy).toHaveBeenCalledTimes(1);
    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    expect(windowCloseSpy).toHaveBeenCalledTimes(0);
  });

  it('should close connections correctly', async () => {
    const windowManager = new WindowManager();
    windowManager.init();
    windowManager.setWalletUrl('https://wallet.example.com');
    windowManager.closeConnection();

    expect(windowAddListenerSpy).toHaveBeenCalledTimes(1);
    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    expect(windowCloseSpy).toHaveBeenCalledTimes(0);
  });

  it('should call add event listener successfully', async () => {
    const windowManager = new WindowManager();
    await windowManager.init();
    windowManager.handshake(WindowProviderRequestEnums.loginRequest);
    windowManager.listenOnce(WindowProviderResponseEnums.loginResponse);

    expect(windowAddListenerSpy).toHaveBeenCalledTimes(2);
  });

  const getMessageHandlers = (spy: jest.SpyInstance) =>
    spy.mock.calls
      .filter(([eventName]) => eventName === 'message')
      .map(([, handler]) => handler);

  // jsdom only accepts real windows as MessageEvent `source`, so set it directly
  const messageEvent = (origin: string, data: unknown, source: unknown) => {
    const event = new MessageEvent('message', { origin, data });
    Object.defineProperty(event, 'source', { value: source });
    return event;
  };

  const handshakeEvent = (
    origin: string,
    payload: string,
    source: unknown = walletWindowMock
  ) =>
    messageEvent(
      origin,
      { type: WindowProviderResponseEnums.handshakeResponse, payload },
      source
    );

  it('should keep a single handshake change listener', () => {
    const windowManager = new WindowManager();
    windowManager.setWalletUrl('https://wallet.example.com');

    (windowManager as any).addHandshakeChangeListener();
    (windowManager as any).addHandshakeChangeListener();

    const [first, second] = getMessageHandlers(windowAddListenerSpy);
    expect(windowRemoveListenerSpy).toHaveBeenCalledWith('message', first);
    expect(windowRemoveListenerSpy).not.toHaveBeenCalledWith('message', second);
  });

  it('should ignore handshake messages from a previous wallet origin', () => {
    const windowManager = new WindowManager();
    windowManager.setWalletUrl('https://old-wallet.example.com');
    (windowManager as any).addHandshakeChangeListener();
    const [handler] = getMessageHandlers(windowAddListenerSpy);

    windowManager.walletWindow = walletWindowMock as unknown as Window;
    windowManager.setWalletUrl('https://new-wallet.example.com');

    handler(handshakeEvent('https://old-wallet.example.com', ''));
    expect(walletWindowMock.close).not.toHaveBeenCalled();
    expect(windowManager.walletWindow).not.toBeNull();

    handler(handshakeEvent('https://new-wallet.example.com', ''));
    expect(walletWindowMock.close).toHaveBeenCalledTimes(1);
    expect(windowManager.walletWindow).toBeNull();
  });

  it('should ignore handshake messages from another window on the wallet origin', () => {
    const windowManager = new WindowManager();
    windowManager.setWalletUrl('https://wallet.example.com');
    windowManager.walletWindow = walletWindowMock as unknown as Window;
    (windowManager as any).addHandshakeChangeListener();
    const [handler] = getMessageHandlers(windowAddListenerSpy);

    handler(handshakeEvent('https://wallet.example.com', '', {}));
    expect(walletWindowMock.close).not.toHaveBeenCalled();
    expect(windowManager.walletWindow).not.toBeNull();
  });

  it('should resolve listenOnce only for messages from the wallet window', async () => {
    const windowManager = new WindowManager();
    windowManager.setWalletUrl('https://wallet.example.com');
    windowManager.walletWindow = walletWindowMock as unknown as Window;

    let resolved = false;
    const response = windowManager
      .listenOnce(WindowProviderResponseEnums.loginResponse)
      .then((result) => {
        resolved = true;
        return result;
      });
    const [handler] = getMessageHandlers(windowAddListenerSpy);

    const data = {
      type: WindowProviderResponseEnums.loginResponse,
      payload: { data: { address: 'erd1test', signature: 'sig' } }
    };

    // Same origin, different window
    handler(messageEvent('https://wallet.example.com', data, {}));
    // Wallet window, wrong origin
    handler(messageEvent('https://different.example.com', data, walletWindowMock));
    // Malformed data from another origin must not throw
    expect(() =>
      handler(messageEvent('https://different.example.com', null, {}))
    ).not.toThrow();

    // Let any resolution settle before checking
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(resolved).toBe(false);

    handler(messageEvent('https://wallet.example.com', data, walletWindowMock));
    await expect(response).resolves.toEqual(data);
  });

  it('should call postMessage successfully', async () => {
    const windowManager = new WindowManager();
    windowManager.postMessage({
      type: WindowProviderRequestEnums.loginRequest,
      payload: {
        token: 'token'
      }
    });

    expect(windowAddListenerSpy).toHaveBeenCalledTimes(1);
    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    expect(windowCloseSpy).toHaveBeenCalledTimes(0);
  });
});
