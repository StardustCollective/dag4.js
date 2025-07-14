import { Proof } from "./transaction";

export type SnapshotV2 = {
  hash: string;
  ordinal: number;
  height: number;
  subHeight: number;
  lastSnapshotHash: string;
  blocks: string[];
  epochProgress?: number | null;
  timestamp: string;
  metagraphSnapshotCount?: number | null;
};

export type StateProof = {
  activeAllowSpends: string;
  activeTokenLocks: string;
  balancesProof: string;
  lastAllowSpendRefs: string;
  lastCurrencySnapshotsProof: {
    leafCount: number;
    hash: string;
  };
  lastStateChannelSnapshotHashesProof: string;
  lastTokenLockRefs: string;
  lastTxRefsProof: string;
  tokenLockBalances: string;
  updateNodeParameters: string;
};

export type Tips = {
  deprecated: {
    block: { height: number; hash: string };
    deprecatedAt: number;
  }[];
  remainedActive: {
    block: { height: number; hash: string };
    introducedAt: number;
    usageCount: number;
  }[];
};

export type SnapshotL0Value = {
  allowSpendBlocks: any[];
  blocks: string[];
  epochProgress: number;
  height: number;
  lastSnapshotHash: string;
  nextFacilitators: string[];
  ordinal: number;
  rewards: any[];
  spendActions: any;
  stateChannelSnapshots: {
    [key: string]: {
      value: { lastSnapshotHash: string; content: number[]; fee: number };
      proofs: Proof[];
    }[];
  };
  stateProof: StateProof;
  subHeight: number;
  tips: Tips;
  tokenLockBlocks: any[];
  updateNodeParameters: any;
  version: string;
};

export type SnapshotL0 = {
  value: SnapshotL0Value;
  proofs: Proof[];
};

export type CurrencySnapshotV2 = {
  hash: string;
  ordinal: number;
  height: number;
  subHeight: number;
  lastSnapshotHash: string;
  blocks: string[];
  epochProgress: number;
  timestamp: string;
  fee?: number | null;
  stakingAddress?: string | null;
  ownerAddress?: string | null;
  sizeInKB?: number | null;
}
