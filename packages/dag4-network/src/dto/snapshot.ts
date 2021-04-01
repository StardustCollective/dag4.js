export type TransactionDag = {
  hash: string;
  from: string;
  to: string;
}

export type SnapshotCacheInfo = {
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
}

export type Snapshot = {
  latestSnapshotInfo?: SnapshotCacheInfo;
  "hash": string,
  "height": number,
  "checkpointBlocks": string[],
  "timestamp": string
}
