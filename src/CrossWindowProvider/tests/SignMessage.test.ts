import { SignableMessage } from '@multiversx/sdk-core/out';
import { getWalletWindowMock, WalletWindowMockType } from '../../test-utils';
import { CrossWindowProvider } from '../CrossWindowProvider';

describe('CrossWindowProvider Login', () => {
  let crossWindowProvider: CrossWindowProvider;
  let walletWindowMock: WalletWindowMockType;
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    walletWindowMock = getWalletWindowMock();
    CrossWindowProvider.getInstance().getWindowManager().postMessage = jest
      .fn()
      .mockImplementation(() => ({
        payload: {
          data: {
            status: 'signed',
            signature: Buffer.from('testSignature').toString('hex')
          }
        }
      }));

    crossWindowProvider = CrossWindowProvider.getInstance();
    windowOpenSpy = jest.spyOn(window, 'open');
    windowOpenSpy.mockImplementation(() => walletWindowMock);
  });

  it('should sign a message correctly', async () => {
    const mockMessage = new SignableMessage({ message: Buffer.from('test') });
    crossWindowProvider.setAddress('testAddress');
    await crossWindowProvider.init();
    const result = await crossWindowProvider.signMessage(mockMessage);

    expect(result.signature.toString()).toBe('testSignature');
  });
});
