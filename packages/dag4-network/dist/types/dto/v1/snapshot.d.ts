export declare type TransactionDag = {
    hash: string;
    from: string;
    to: string;
};
export declare type SnapshotCacheInfo = {
    blockCount: number;
    blockHeight: number;
    cacheJobStatus: string;
    dateStr: string;
    dagAmount: number;
    rebuildTime: number;
    snapshotId: string;
    txsWithAmount: TransactionDag[];
    date: number;
    txCount: number;
};
export declare type Snapshot = {
    latestSnapshotInfo?: SnapshotCacheInfo;
    "hash": string;
    "height": number;
    "checkpointBlocks": string[];
    "timestamp": string;
};
