import { KeyTrio, PostTransaction, PostTransactionV2 } from '@stardust-collective/dag4-keystore';
import { NetworkInfo, PendingTx } from '@stardust-collective/dag4-network';
import { Subject } from 'rxjs';
export declare class DagAccount {
    private m_keyTrio;
    private sessionChange$;
    private network;
    connect(networkInfo: NetworkInfo): this;
    get address(): string;
    get keyTrio(): KeyTrio;
    loginSeedPhrase(words: string): void;
    loginPrivateKey(privateKey: string): void;
    loginPublicKey(publicKey: string): void;
    isActive(): boolean;
    logout(): void;
    observeSessionChange(): Subject<boolean>;
    setKeysAndAddress(privateKey: string, publicKey: string, address: string): void;
    getTransactions(limit?: number, searchAfter?: string): Promise<import("@stardust-collective/dag4-network").Transaction[]>;
    validateDagAddress(address: string): boolean;
    getBalance(): Promise<number>;
    getBalanceFor(address: string): Promise<number>;
    getFeeRecommendation(): Promise<number>;
    generateSignedTransaction(toAddress: string, amount: number, fee?: number, lastRef?: any): Promise<PostTransaction | PostTransactionV2>;
    transferDag(toAddress: string, amount: number, fee?: number, autoEstimateFee?: boolean): Promise<PendingTx>;
    waitForCheckPointAccepted(hash: string): Promise<boolean>;
    waitForBalanceChange(initialValue?: number): Promise<boolean>;
    private wait;
    transferDagBatch(transfers: TransferBatchItem[]): void;
}
declare type TransferBatchItem = {
    address: string;
    amount: number;
    fee?: number;
};
export {};
