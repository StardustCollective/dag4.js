export function encodeTx(tx: any, embedSpaces: any, hashReference: any): string;
export function decodeTx(tx: any): {
    edge: {
        observationEdge: {
            parents: {
                hashReference: string;
                hashType: string;
            }[];
            data: {
                hashType: string;
            };
        };
        signedObservationEdge: {
            signatureBatch: {
                signatures: any[];
            };
        };
        data: {
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
