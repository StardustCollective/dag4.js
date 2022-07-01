import { Transaction, PendingTx } from '@stardust-collective/dag4-network';
import { Subject } from 'rxjs';
declare type WalletParent = {
    getTransactions(limit?: number, searchAfter?: string): Promise<Transaction[]>;
    address: string;
};
export declare class DagMonitor {
    private walletParent;
    private memPoolChange$;
    private lastTimer;
    private pendingTimer;
    private waitForMap;
    constructor(walletParent: WalletParent);
    observeMemPoolChange(): Subject<DagWalletMonitorUpdate>;
    addToMemPoolMonitor(value: PendingTx | string): Transaction;
    getLatestTransactions(address: string, limit?: number, searchAfter?: string): Promise<Transaction[]>;
    getMemPoolFromMonitor(address?: string): PendingTx[];
    setToMemPoolMonitor(pool: PendingTx[]): void;
    waitForTransaction(hash: string): Promise<boolean>;
    startMonitor(): void;
    private transformPendingToTransaction;
    private pollPendingTxs;
    private processPendingTxs;
    private get cacheUtils();
}
export declare type DagWalletMonitorUpdate = {
    pendingHasConfirmed: boolean;
    transTxs: PendingTx[];
    txChanged: boolean;
};
export {};
