export type TokenLockResponse = {
  currencyId: string | null;
  hash: string;
  ordinal: number;
  amount: number;
  source: string;
  timestamp: string;
  globalSnapshotHash: string;
  globalSnapshotOrdinal: number;

  unlockEpoch: number | null;
  parentHash: string;
  unlockedAtOrdinal: number | null;
};

export type AllowSpendResponse = {
  currencyId: string | null;
  hash: string;
  ordinal: number;
  amount: number;
  source: string;
  timestamp: string;
  globalSnapshotHash: string;
  globalSnapshotOrdinal: number;
  
  destination: string;
  lastValidEpochProgress: number;
  fee: number;
  snapshotHash: string;
}

export const Actions = ["TokenLock", "TokenUnlock", "AllowSpend", "ExpiredAllowSpend", "DelegateStakeCreate", "DelegateStakeWithdraw", "SpendTransaction", "FeeTransaction", "ExpiredSpendTransaction"] as const;
export type ActionType = (typeof Actions)[number];

export type ActionResponse = {
  type: ActionType;
  currencyId: string | null;
  hash: string;
  amount: number;
  source: string;
  destination: string | null;
  unlockEpoch: number | null;
  parentHash: string;
  timestamp: string;
  globalSnapshotHash: string;
  globalSnapshotOrdinal: number;
}