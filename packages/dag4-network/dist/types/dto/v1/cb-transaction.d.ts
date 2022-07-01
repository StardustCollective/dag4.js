export declare type CbTransaction = {
    transaction: {
        edge: {
            observationEdge: {
                parents: {
                    hashReference: string;
                    hashType: string;
                }[];
                data: {
                    hashReference: string;
                    hashType: string;
                };
            };
            signedObservationEdge: {
                signatureBatch: {
                    hash: string;
                    signatures: {
                        signature: string;
                        id: {
                            hex: string;
                        };
                    }[];
                };
            };
            data: {
                amount: number;
                lastTxRef: {
                    prevHash: string;
                    ordinal: number;
                };
                fee: number;
                salt: number;
            };
        };
        lastTxRef: {
            prevHash: string;
            ordinal: number;
        };
        isDummy: false;
        isTest: false;
    };
    cbBaseHash: string;
    rxTime: number;
};
