import { Transaction } from '@multiversx/sdk-core/out';
import { CrossWindowProvider } from '../../index';
import { createMockTransaction } from '../../test-utils';
import { WindowManager } from '../../WindowManager';

describe('CrossWindowProvider Login', () => {
  let crossWindowProvider: CrossWindowProvider;
  let mockWalletWindow: { close: jest.Func; postMessage: jest.Func };
  let windowOpenSpy: jest.SpyInstance;

  let mockTransaction: Transaction;

  beforeEach(() => {
    mockWalletWindow = { close: jest.fn(), postMessage: jest.fn() };
    mockTransaction = createMockTransaction({
      data: 'data',
      receiverUsername: 'receiver',
      senderUsername: 'sender'
    });

    WindowManager.getInstance().postMessage = jest
      .fn()
      .mockImplementation(() => ({
        payload: { data: [mockTransaction.toPlainObject()] }
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

  it('should sign a transaction correctly', async () => {
    crossWindowProvider.setAddress('testAddress');
    await crossWindowProvider.init();

    const result = await crossWindowProvider.signTransaction(mockTransaction);
    expect(result).toStrictEqual(mockTransaction);
  });
});
