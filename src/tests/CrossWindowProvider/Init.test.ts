import { CrossWindowProvider } from '../../index';
import { WindowManager } from '../../WindowManager';

describe('CrossWindowProvider', () => {
  let crossWindowProvider: CrossWindowProvider;

  beforeEach(() => {
    crossWindowProvider = CrossWindowProvider.getInstance();

    // Mocking the WindowManager methods
    WindowManager.getInstance = jest.fn().mockReturnValue({
      init: jest.fn().mockResolvedValue(true),
      postMessage: jest.fn().mockResolvedValue({ payload: {} }),
      closeConnection: jest.fn().mockResolvedValue(true)
    });
  });

  it('should be a singleton instance', () => {
    const anotherInstance = CrossWindowProvider.getInstance();
    expect(crossWindowProvider).toBe(anotherInstance);
  });

  it('should initialize correctly', async () => {
    const result = await crossWindowProvider.init();
    expect(result).toBeTruthy();
    expect(crossWindowProvider.isInitialized()).toBe(true);
  });

  it('should get address correctly', async () => {
    await crossWindowProvider.init();
    crossWindowProvider.setAddress('testAddress');
    const address = await crossWindowProvider.getAddress();
    expect(address).toBe('testAddress');
  });
});
