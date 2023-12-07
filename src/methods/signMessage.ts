import { SignableMessage } from '@multiversx/sdk-core/out/signableMessage';
import { ErrCouldNotSignMessage } from '../errors';
import { buildWalletQueryString } from '../helpers/buildWalletQueryString';
import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums,
  PrivateMethodsType,
  SignMessageStatusEnum
} from '../types';

export const signMessage =
  (self: PrivateMethodsType) =>
  async (message: SignableMessage): Promise<SignableMessage> => {
    self.ensureConnected();
    await self.handshake();
    await self.connectWallet();

    const payloadQueryString = buildWalletQueryString({
      params: {
        message: message.message.toString()
      }
    });

    self.walletWindow?.postMessage(
      {
        type: CrossWindowProviderRequestEnums.signMessageRequest,
        payload: payloadQueryString
      },
      self.walletUrl
    );
    const {
      payload: { status, signature }
    } = await self.listenOnce(
      CrossWindowProviderResponseEnums.signMessageResponse
    );

    self.walletWindow?.close();

    if (status !== SignMessageStatusEnum.signed) {
      throw new ErrCouldNotSignMessage();
    }

    message.applySignature(Buffer.from(String(signature), 'hex'));

    return message;
  };
