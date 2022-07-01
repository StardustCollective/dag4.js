import { SnapshotV2, TransactionV2, RewardTransaction, AddressBalance, BlockV2 } from '../../dto/v2';
declare type HashOrOrdinal = string | number;
export declare class BlockExplorerV2Api {
    private service;
    constructor(host?: string);
    config(): import("@stardust-collective/dag4-core").RestConfig;
    getSnapshot(id: HashOrOrdinal): Promise<SnapshotV2>;
    getTransactionsBySnapshot(id: HashOrOrdinal): Promise<TransactionV2[]>;
    getRewardsBySnapshot(id: HashOrOrdinal): Promise<RewardTransaction>;
    getLatestSnapshot(): Promise<SnapshotV2>;
    getLatestSnapshotTransactions(): Promise<TransactionV2>;
    getLatestSnapshotRewards(): Promise<RewardTransaction>;
    _formatDate(date: string, paramName: string): string;
    getTransactionsByAddress(address: string, limit?: number, searchAfter?: string, sentOnly?: boolean, receivedOnly?: boolean, searchBefore?: string): Promise<TransactionV2[]>;
    getTransaction(hash: string): Promise<TransactionV2>;
    getAddressBalance(hash: string): Promise<AddressBalance>;
    getCheckpointBlock(hash: string): Promise<BlockV2>;
}
export declare const blockExplorerApi: BlockExplorerV2Api;
export {};
