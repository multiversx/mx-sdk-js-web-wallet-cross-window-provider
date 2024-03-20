import { Transaction } from '@multiversx/sdk-core/out';
export declare const createMockTransaction: ({ data, receiverUsername, senderUsername }: {
    data: string;
    receiverUsername: string;
    senderUsername: string;
}) => Transaction;
