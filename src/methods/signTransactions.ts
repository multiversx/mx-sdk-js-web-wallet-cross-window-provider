import { Transaction } from '@multiversx/sdk-core/out/transaction';

import { ErrCouldNotSignTransaction, ErrTransactionCAncelled } from '../errors';
import { buildTransactionsQueryString } from '../helpers';
import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums,
  PrivateMethodsType
} from '../types';

export const signTransactions =
  (self: PrivateMethodsType) =>
  async (transactions: Transaction[]): Promise<Transaction[]> => {
    self.ensureConnected();
    await self.handshake();
    await self.connectWallet();

    const payloadQueryString = buildTransactionsQueryString(transactions);

    self.walletWindow?.postMessage(
      {
        type: CrossWindowProviderRequestEnums.signTransactionsRequest,
        payload: payloadQueryString
      },
      self.walletUrl
    );

    const { type: response, payload: signedPlainTransactions } =
      await self.listenOnce(
        CrossWindowProviderResponseEnums.signTransactionsResponse
      );

    const type = response as
      | CrossWindowProviderResponseEnums.signTransactionsResponse
      | CrossWindowProviderResponseEnums.cancelResponse;

    self.walletWindow?.close();

    if (type === CrossWindowProviderResponseEnums.cancelResponse) {
      throw new ErrTransactionCAncelled();
    }

    const hasTransactions = signedPlainTransactions?.length > 0;

    if (!hasTransactions) {
      throw new ErrCouldNotSignTransaction();
    }

    const signedTransactions = signedPlainTransactions.map((tx) =>
      Transaction.fromPlainObject(tx)
    );

    return signedTransactions;
  };
