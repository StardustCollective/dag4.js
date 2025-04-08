import { Proof, TransactionReference } from "./transaction";

// Token Lock

export type TokenLockBody = {
  source: string;
  amount: number;
  fee?: number;
  currencyId: string | null;
  parent: TransactionReference;
  unlockEpoch: number | null;
};

export type SignedTokenLock = {
  value: TokenLockBody;
  proofs: Proof[];
};

// Allow Spend

export type AllowSpendBody = {
  source: string;
  destination: string;
  approvers: string[];
  amount: number;
  fee?: number;
  currencyId: string | null;
  parent: TransactionReference;
  lastValidEpochProgress: number;
};

export type SignedAllowSpend = {
  value: AllowSpendBody;
  proofs: Proof[];
};

// Delegated Stake

export type DelegatedStakeBody = {
  nodeId: string;
  amount: number;
  fee?: number;
  tokenLockRef: string;
  parent: TransactionReference;
};

export type SignedDelegatedStake = {
  value: DelegatedStakeBody;
  proofs: Proof[];
};

// Withdraw Delegated Stake

export type WithdrawDelegatedStakeBody = {
  stakeRef: TransactionReference;
};

export type SignedWithdrawDelegatedStake = {
  value: WithdrawDelegatedStakeBody;
  proofs: Proof[];
};
