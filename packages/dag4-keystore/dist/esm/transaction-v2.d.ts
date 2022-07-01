import { TransactionInterface } from './transaction';
export declare type AddressLastRefV2 = {
    hash: string;
    ordinal: number;
};
export declare type TransactionPropsV2 = {
    fromAddress?: string;
    toAddress?: string;
    amount?: number;
    fee?: number;
    lastTxRef?: AddressLastRefV2;
    salt?: string | bigint;
};
export declare type Proof = {
    signature: string;
    id: string;
};
export declare type PostTransactionV2 = {
    value: {
        source: string;
        destination: string;
        amount: number;
        fee: number;
        parent: AddressLastRefV2;
        salt: string | bigint;
    };
    proofs: Proof[];
};
export declare class TransactionV2 implements TransactionInterface {
    private tx;
    constructor({ fromAddress, toAddress, amount, fee, lastTxRef, salt }: TransactionPropsV2);
    static fromPostTransaction(tx: PostTransactionV2): TransactionV2;
    static toHexString(val: bigint | string): any;
    getPostTransaction(): {
        value: {
            salt: string;
            source: string;
            destination: string;
            amount: number;
            fee: number;
            parent: AddressLastRefV2;
        };
        proofs: Proof[];
    };
    getEncoded(): string;
    setEncodedHashReference(): void;
    setSignatureBatchHash(hash: string): void;
    addSignature(proof: Proof): void;
}
export default TransactionV2;
