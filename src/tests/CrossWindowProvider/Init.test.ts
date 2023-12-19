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

  // it('should sign a transaction correctly', async () => {
  //   const mockTransaction = createMockTransaction({
  //     data: 'data',
  //     receiverUsername: 'receiver',
  //     senderUsername: 'sender'
  //   });
  //   crossWindowProvider.setAddress('testAddress');
  //   await crossWindowProvider.init();
  //
  //   // Mocking postMessage to simulate transaction signing
  //   WindowManager.getInstance().postMessage = jest.fn().mockResolvedValue({
  //     payload: { data: [mockTransaction] }
  //   });
  //
  //   const result = await crossWindowProvider.signTransaction(mockTransaction);
  //   expect(result).toBe(mockTransaction);
  // });
  //
  // it('should sign a message correctly', async () => {
  //   const mockMessage = new SignableMessage({ message: Buffer.from('test') });
  //   crossWindowProvider.setAddress('testAddress');
  //   await crossWindowProvider.init();
  //
  //   // Mocking postMessage to simulate message signing
  //   WindowManager.getInstance().postMessage = jest.fn().mockResolvedValue({
  //     payload: { data: { status: 'signed', signature: 'testSignature' } }
  //   });
  //
  //   const result = await crossWindowProvider.signMessage(mockMessage);
  //   expect(result.signature).toBe('testSignature');
  // });
  //
  // it('should cancel an action correctly', async () => {
  //   await crossWindowProvider.init();
  //   const result = await crossWindowProvider.cancelAction();
  //   expect(result).toEqual({ payload: {} });
  // });

  // Additional tests for error handling and other methods
});
