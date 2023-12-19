import { buildTransactionsQueryString } from '../buildTransactionsQueryString';
import {
  Address,
  Transaction,
  TransactionPayload
} from '@multiversx/sdk-core/out';
import { mockWindowLocation } from '../../test-utils';

beforeAll(() => {
  mockWindowLocation({ href: 'https://example.com' });
});

const createMockTransaction = ({
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
    chainID: '1'
  });
};

describe('buildTransactionsQueryString', () => {
  it('should return only callbackUrl when no transactions are provided', () => {
    const result = buildTransactionsQueryString([]);
    expect(result).toBe('callbackUrl=https://example.com');
  });

  it('should handle a single transaction', () => {
    const transaction = createMockTransaction({
      data: 'someData',
      receiverUsername: 'receiverUser',
      senderUsername: 'senderUser'
    });
    const result = buildTransactionsQueryString([transaction]);
    expect(result).toBe(
      'nonce%5B0%5D=0&value%5B0%5D=0&receiver%5B0%5D=erd1wh9c0sjr2xn8hzf02lwwcr4jk2s84tat9ud2kaq6zr7xzpvl9l5q8awmex&sender%5B0%5D=erd1wh9c0sjr2xn8hzf02lwwcr4jk2s84tat9ud2kaq6zr7xzpvl9l5q8awmex&senderUsername%5B0%5D=c2VuZGVyVXNlcg%3D%3D&receiverUsername%5B0%5D=cmVjZWl2ZXJVc2Vy&gasPrice%5B0%5D=1000000000&gasLimit%5B0%5D=100000&data%5B0%5D=someData&chainID%5B0%5D=1&version%5B0%5D=1&callbackUrl=https://example.com'
    );
  });

  it('should handle multiple transactions', () => {
    const transactions = [
      createMockTransaction({
        data: 'data1',
        receiverUsername: 'receiver1',
        senderUsername: 'sender1'
      }),

      createMockTransaction({
        data: 'data2',
        receiverUsername: 'receiver2',
        senderUsername: 'sender2'
      })
    ];

    const result = buildTransactionsQueryString(transactions);
    expect(result).toBe(
      'nonce%5B0%5D=0&nonce%5B1%5D=0&value%5B0%5D=0&value%5B1%5D=0&receiver%5B0%5D=erd1wh9c0sjr2xn8hzf02lwwcr4jk2s84tat9ud2kaq6zr7xzpvl9l5q8awmex&receiver%5B1%5D=erd1wh9c0sjr2xn8hzf02lwwcr4jk2s84tat9ud2kaq6zr7xzpvl9l5q8awmex&sender%5B0%5D=erd1wh9c0sjr2xn8hzf02lwwcr4jk2s84tat9ud2kaq6zr7xzpvl9l5q8awmex&sender%5B1%5D=erd1wh9c0sjr2xn8hzf02lwwcr4jk2s84tat9ud2kaq6zr7xzpvl9l5q8awmex&senderUsername%5B0%5D=c2VuZGVyMQ%3D%3D&senderUsername%5B1%5D=c2VuZGVyMg%3D%3D&receiverUsername%5B0%5D=cmVjZWl2ZXIx&receiverUsername%5B1%5D=cmVjZWl2ZXIy&gasPrice%5B0%5D=1000000000&gasPrice%5B1%5D=1000000000&gasLimit%5B0%5D=100000&gasLimit%5B1%5D=100000&data%5B0%5D=data1&data%5B1%5D=data2&chainID%5B0%5D=1&chainID%5B1%5D=1&version%5B0%5D=1&version%5B1%5D=1&callbackUrl=https://example.com'
    );
  });

  it('should handle transactions with special characters', () => {
    const transaction = createMockTransaction({
      data: 'data&with&special%characters?',
      receiverUsername: 'receiver&User',
      senderUsername: 'sender%User'
    });
    const result = buildTransactionsQueryString([transaction]);
    expect(result).toBe(
      'nonce%5B0%5D=0&value%5B0%5D=0&receiver%5B0%5D=erd1wh9c0sjr2xn8hzf02lwwcr4jk2s84tat9ud2kaq6zr7xzpvl9l5q8awmex&sender%5B0%5D=erd1wh9c0sjr2xn8hzf02lwwcr4jk2s84tat9ud2kaq6zr7xzpvl9l5q8awmex&senderUsername%5B0%5D=c2VuZGVyJVVzZXI%3D&receiverUsername%5B0%5D=cmVjZWl2ZXImVXNlcg%3D%3D&gasPrice%5B0%5D=1000000000&gasLimit%5B0%5D=100000&data%5B0%5D=data%26with%26special%25characters%3F&chainID%5B0%5D=1&version%5B0%5D=1&callbackUrl=https://example.com'
    );
  });
});
