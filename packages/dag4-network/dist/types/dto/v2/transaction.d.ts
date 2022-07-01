export declare type TransactionReference = {
    hash: string;
    ordinal: number;
};
export declare type TransactionOriginal = {
    hash: string;
    ordinal: number;
};
export declare type TransactionV2 = {
    hash: string;
    source: string;
    destination: string;
    amount: number;
    fee: number;
    parent: TransactionReference;
    snapshot: string;
    block: string;
    timestamp: string;
    transactionOriginal: TransactionOriginal;
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
        parent: TransactionReference;
        salt: bigint | string;
    };
    proofs: Proof[];
};
