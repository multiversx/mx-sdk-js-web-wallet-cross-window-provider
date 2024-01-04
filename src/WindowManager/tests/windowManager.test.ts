import { getWalletWindowMock } from '../../test-utils';
import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums
} from '../../types';
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

  it('should call handshake successfully', async () => {
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

  it('should call add event listener successfully', async () => {
    const windowManager = WindowManager.getInstance();
    windowManager.listenOnce(CrossWindowProviderResponseEnums.loginResponse);

    expect(windowAddListenerSpy).toHaveBeenCalledTimes(1);
  });

  it('should call postMessage successfully', async () => {
    const windowManager = WindowManager.getInstance();
    windowManager.postMessage({
      type: CrossWindowProviderRequestEnums.loginRequest,
      payload: 'login'
    });

    expect(windowAddListenerSpy).toHaveBeenCalledTimes(1);
    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    expect(windowCloseSpy).toHaveBeenCalledTimes(0);
  });
});
