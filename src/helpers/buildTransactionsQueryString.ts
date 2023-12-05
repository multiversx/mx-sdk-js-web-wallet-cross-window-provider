import { Transaction } from "@multiversx/sdk-core/out";
import { buildWalletQueryString } from "./buildWalletQueryString";

export const buildTransactionsQueryString = (
    transactions: Transaction[]
  ): string => {
    const jsonToSend: any = {};
    transactions.map((tx) => {
      const plainTx = prepareWalletTransaction(tx);
      for (const txProp in plainTx) {
        if (
          plainTx.hasOwnProperty(txProp) &&
          !jsonToSend.hasOwnProperty(txProp)
        ) {
          jsonToSend[txProp] = [];
        }
  
        jsonToSend[txProp].push(plainTx[txProp]);
      }
    });
  
    return buildWalletQueryString({
      params: jsonToSend,
    });
  };

  const prepareWalletTransaction = (transaction: Transaction): any => {
    const plainTransaction = transaction.toPlainObject();
  
    // We adjust the data field, in order to make it compatible with what the web wallet expects.
    if (plainTransaction.data) {
      plainTransaction.data = Buffer.from(
        plainTransaction.data,
        "base64"
      ).toString();
  
      if (plainTransaction.receiverUsername) {
        plainTransaction.receiverUsername = Buffer.from(
          plainTransaction.receiverUsername,
          "base64"
        ).toString();
      }
  
      if (plainTransaction.senderUsername) {
        plainTransaction.senderUsername = Buffer.from(
          plainTransaction.senderUsername,
          "base64"
        ).toString();
      }
      // The web wallet expects the data field to be a string, even if it's empty (early 2023).
      plainTransaction.data = plainTransaction.data || "";
    }
  
    return plainTransaction;
  };