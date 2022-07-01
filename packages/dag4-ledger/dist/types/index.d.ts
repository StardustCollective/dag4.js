export declare type LedgerAccount = {
    publicKey: string;
    address: string;
    balance: string;
};
interface LedgerTransport {
    list(): Promise<string[]>;
    open(string: string): Promise<any>;
    isSupported(): Promise<boolean>;
}
export declare class LedgerBridge {
    private transport;
    constructor(transport: LedgerTransport);
    buildTx(amount: number, publicKey: string, bip44Index: number, fromAddress: string, toAddress: string): Promise<any>;
    /**
     * Returns a signed transaction ready to be posted to the network.
     */
    signTransaction(publicKey: string, bip44Index: number, hash: string, ledgerEncodedTx: string): Promise<string>;
    /**
     * Takes a signed transaction and posts it to the network.
     */
    postTransaction(): void;
    getAccountInfoForPublicKeys(ledgerAccounts: {
        publicKey: string;
    }[]): Promise<any[]>;
    getPublicKeys(startIndex?: number, numberOfAccounts?: number, progressUpdateCallback?: (progress: number) => void): Promise<any[]>;
    private sign;
    private createBipPathFromAccount;
    private getLedgerInfo;
    private sendExchangeMessage;
    private splitMessageIntoChunks;
    private decodeSignature;
}
export {};
