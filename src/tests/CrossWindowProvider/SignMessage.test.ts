import { SignableMessage } from '@multiversx/sdk-core/out';
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

  test.skip('should sign a message correctly', async () => {
    const mockMessage = new SignableMessage({ message: Buffer.from('test') });
    crossWindowProvider.setAddress('testAddress');
    await crossWindowProvider.init();

    // Mocking postMessage to simulate message signing
    WindowManager.getInstance().postMessage = jest.fn().mockResolvedValue({
      payload: { data: { status: 'signed', signature: 'testSignature' } }
    });

    const result = await crossWindowProvider.signMessage(mockMessage);
    expect(result.signature).toBe('testSignature');
  });
});
