export declare type AddressLastRef = {
    prevHash: string;
    ordinal: number;
};
export declare type TransactionProps = {
    fromAddress?: string;
    toAddress?: string;
    amount?: number;
    fee?: number;
    lastTxRef?: AddressLastRef;
    salt?: number;
    signedObservationEdge?: any;
};
export declare type SignatureElt = {
    signature: string;
    id: {
        hex: string;
    };
};
export declare type PostTransaction = {
    edge: {
        observationEdge: {
            parents: {
                hashReference: string;
                hashType: 'AddressHash';
            }[];
            data: {
                hashType: 'TransactionDataHash';
                hashReference: string;
            };
        };
        signedObservationEdge: {
            signatureBatch: {
                hash: string;
                signatures: SignatureElt[];
            };
        };
        data: {
            fee?: number;
            amount: number;
            lastTxRef: {
                prevHash: string;
                ordinal: number;
            };
            salt: number;
        };
    };
    lastTxRef: {
        prevHash: string;
        ordinal: number;
    };
    isDummy: boolean;
    isTest: boolean;
};
export interface TransactionInterface {
    getPostTransaction(): any;
    getEncoded(hashReference: boolean): string;
    setEncodedHashReference(): void;
    setSignatureBatchHash(hash: string): void;
    addSignature(signature: Record<string, any>): void;
}
export declare class Transaction implements TransactionInterface {
    private tx;
    constructor({ fromAddress, toAddress, amount, fee, lastTxRef, salt, signedObservationEdge }: TransactionProps);
    static fromPostTransaction(tx: PostTransaction): Transaction;
    getPostTransaction(): PostTransaction;
    getEncoded(hashReference?: boolean): string;
    setEncodedHashReference(): void;
    setSignatureBatchHash(hash: string): void;
    addSignature(signatureElt: SignatureElt): void;
}
export default Transaction;
