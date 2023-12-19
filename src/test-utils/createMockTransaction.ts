import {
  Address,
  Transaction,
  TransactionPayload
} from '@multiversx/sdk-core/out';

export const createMockTransaction = ({
  data,
  receiverUsername,
  senderUsername
}: {
  data: string;
  receiverUsername: string;
  senderUsername: string;
}) => {
  return new Transaction({
    // ...other necessary transaction properties
    sender: new Address(
      'erd1wh9c0sjr2xn8hzf02lwwcr4jk2s84tat9ud2kaq6zr7xzpvl9l5q8awmex'
    ),
    receiver: new Address(
      'erd1wh9c0sjr2xn8hzf02lwwcr4jk2s84tat9ud2kaq6zr7xzpvl9l5q8awmex'
    ),
    data: new TransactionPayload(data),
    receiverUsername: receiverUsername
      ? Buffer.from(receiverUsername).toString('base64')
      : undefined,
    senderUsername: senderUsername
      ? Buffer.from(senderUsername).toString('base64')
      : undefined,
    gasLimit: 100000,
    chainID: '1',
    value: '0'
  });
};
