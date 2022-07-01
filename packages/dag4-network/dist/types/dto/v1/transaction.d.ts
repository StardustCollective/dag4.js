export declare type Transaction = {
    hash: string;
    amount: number;
    receiver: string;
    sender: string;
    fee: number;
    isDummy: boolean;
    timeAgo?: string;
    status?: string;
    timestamp: string;
    lastTransactionRef: {
        prevHash: string;
        ordinal: number;
    };
    snapshotHash: string;
    checkpointBlock: string;
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
